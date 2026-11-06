import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return respond({ error: 'Sesi login diperlukan.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = authHeader.slice(7);
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return respond({ error: 'Sesi tidak valid atau sudah berakhir.' }, 401);
  const { data: caller, error: callerError } = await adminClient
    .from('staff_profiles').select('role,is_active').eq('user_id', userData.user.id).maybeSingle();
  if (callerError || !caller || caller.role !== 'admin' || caller.is_active !== true) {
    return respond({ error: 'Hanya Administrator aktif yang boleh mengelola akun guru.' }, 403);
  }

  let payload: { action?: string; user_id?: string; full_name?: string; nip?: string; subject?: string; password?: string };
  try { payload = await req.json(); } catch { return respond({ error: 'Format permintaan tidak valid.' }, 400); }

  if (payload.action === 'delete' || payload.action === 'reset') {
    const userId = String(payload.user_id ?? '').trim();
    if (!userId) return respond({ error: 'Pengguna tidak valid.' }, 400);
    const { data: target, error: targetError } = await adminClient
      .from('staff_profiles').select('user_id, full_name, role').eq('user_id', userId).maybeSingle();
    if (targetError || !target || target.role !== 'teacher') return respond({ error: 'Akun guru tidak ditemukan.' }, 404);

    if (payload.action === 'delete') {
      const { error: deleteProfileError } = await adminClient.from('staff_profiles').delete().eq('user_id', userId);
      if (deleteProfileError) return respond({ error: `Profil gagal dihapus: ${deleteProfileError.message}` }, 400);
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteAuthError) return respond({ error: `Profil terhapus, tetapi akun login gagal dihapus: ${deleteAuthError.message}` }, 400);
      await adminClient.from('activity_logs').insert({
        actor_user_id: userData.user.id, actor_role: 'admin', action: 'delete_teacher_account',
        entity_table: 'staff_profiles', entity_id: userId, details: { full_name: target.full_name },
      });
      return respond({ success: true });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(12));
    const temporaryPassword = `Sm7-${Array.from(randomValues, value => chars[value % chars.length]).join('')}`;
    const { data: existingUser, error: existingError } = await adminClient.auth.admin.getUserById(userId);
    if (existingError || !existingUser.user) return respond({ error: 'Akun login guru tidak ditemukan.' }, 404);
    const { error: resetError } = await adminClient.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
      user_metadata: { ...existingUser.user.user_metadata, must_change_password: true },
    });
    if (resetError) return respond({ error: `Kata sandi gagal direset: ${resetError.message}` }, 400);
    await adminClient.from('activity_logs').insert({
      actor_user_id: userData.user.id, actor_role: 'admin', action: 'reset_teacher_password',
      entity_table: 'staff_profiles', entity_id: userId, details: { full_name: target.full_name, must_change_password: true },
    });
    return respond({ success: true, temporary_password: temporaryPassword });
  }

  const fullName = String(payload.full_name ?? '').trim();
  const nip = String(payload.nip ?? '').trim();
  const subject = String(payload.subject ?? '').trim();
  const password = String(payload.password ?? '');
  if (fullName.length < 3 || fullName.length > 120) return respond({ error: 'Nama harus 3–120 karakter.' }, 400);
  if (!/^[0-9A-Za-z./-]{5,30}$/.test(nip)) return respond({ error: 'NIP harus 5–30 karakter.' }, 400);
  if (!subject) return respond({ error: 'Mata pelajaran guru wajib dipilih.' }, 400);
  if (password.length < 8 || password.length > 72) return respond({ error: 'Kata sandi harus 8–72 karakter.' }, 400);

  const email = `${nip.toLowerCase()}@guru.sman7maros.id`;
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName, account_type: 'teacher', must_change_password: false },
  });
  if (createError || !created.user) return respond({ error: createError?.message || 'Akun Auth gagal dibuat.' }, 400);
  const { error: profileError } = await adminClient.from('staff_profiles').insert({
    user_id: created.user.id, full_name: fullName, nip, subject, role: 'teacher', is_active: true,
  });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return respond({ error: profileError.code === '23505' ? 'NIP sudah terdaftar.' : `Profil guru gagal dibuat: ${profileError.message}` }, 400);
  }
  await adminClient.from('activity_logs').insert({
    actor_user_id: userData.user.id, actor_role: 'admin', action: 'create_teacher_account',
    entity_table: 'staff_profiles', entity_id: created.user.id, details: { nip, full_name: fullName },
  });
  return respond({ success: true, teacher: { user_id: created.user.id, full_name: fullName, nip, role: 'teacher' } }, 201);
});
