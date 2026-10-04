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

  const { data: account, error: accountError } = await supabase.rpc('get_my_account');

  if (accountError || !account?.[0]) {
    await supabase.auth.signOut();
    throw new Error('Kullanıcı hesabı şirket hesabına bağlanmamış.');
  }

  const row = account[0];
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    email: row.email,
    role: row.role,
    active: row.active,
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

  const { data: account, error } = await supabase.rpc('get_my_account');

  if (error) throw error;
  if (!account?.[0]) return null;

  const row = account[0];
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    email: row.email,
    role: row.role,
    active: row.active,
  };
}
