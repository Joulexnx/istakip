import { supabase } from '@/lib/supabase';

export const isSupabaseAuthEnabled = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export interface SupabaseAccount {
  id: string;
  companyId: string;
  employeeId: string | null;
  email: string;
  role: 'yonetici' | 'yardimci' | 'calisan';
  active: boolean;
}

export async function loginWithSupabase(email: string, password: string): Promise<SupabaseAccount> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Supabase kullanıcı oturumu oluşturulamadı.');

  const { data: account, error: accountError } = await supabase
    .from('user_accounts')
    .select('id, company_id, employee_id, email, role, active')
    .eq('auth_user_id', data.user.id)
    .eq('active', true)
    .single();

  if (accountError) {
    await supabase.auth.signOut();
    throw new Error('Kullanıcı hesabı şirket hesabına bağlanmamış.');
  }

  return {
    id: account.id,
    companyId: account.company_id,
    employeeId: account.employee_id,
    email: account.email,
    role: account.role,
    active: account.active,
  };
}

export async function logoutFromSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentSupabaseAccount(): Promise<SupabaseAccount | null> {
  const session = await getSupabaseSession();
  if (!session?.user) return null;

  const { data: account, error } = await supabase
    .from('user_accounts')
    .select('id, company_id, employee_id, email, role, active')
    .eq('auth_user_id', session.user.id)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  if (!account) return null;

  return {
    id: account.id,
    companyId: account.company_id,
    employeeId: account.employee_id,
    email: account.email,
    role: account.role,
    active: account.active,
  };
}
