import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types/models';

type CustomerRow = Record<string, unknown>;

const mapCustomer = (r: CustomerRow): Customer => ({
  companyId: String(r.company_id),
  id: String(r.id),
  company: String(r.company),
  contact: String(r.contact ?? ''),
  phone: String(r.phone ?? ''),
  email: String(r.email ?? ''),
  address: String(r.address ?? ''),
  taxOffice: String(r.tax_office ?? ''),
  taxNo: String(r.tax_no ?? ''),
  note: String(r.note ?? ''),
  tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
  status: r.status as Customer['status'],
});

function requireCustomer(data: CustomerRow | null, error: { message: string } | null): Customer {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Müşteri verisi alınamadı.');
  return mapCustomer(data);
}

export async function insertSupabaseCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert({
    id: customer.id,
    company_id: customer.companyId,
    company: customer.company,
    contact: customer.contact,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    tax_office: customer.taxOffice,
    tax_no: customer.taxNo,
    note: customer.note,
    tags: customer.tags,
    status: customer.status,
  }).select('*').single();

  return requireCustomer(data as CustomerRow | null, error);
}

export async function updateSupabaseCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
  const row: Record<string, unknown> = {};
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.contact !== undefined) row.contact = patch.contact;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.taxOffice !== undefined) row.tax_office = patch.taxOffice;
  if (patch.taxNo !== undefined) row.tax_no = patch.taxNo;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.status !== undefined) row.status = patch.status;

  const { data, error } = await supabase.from('customers').update(row).eq('id', id).select('*').single();
  return requireCustomer(data as CustomerRow | null, error);
}

export async function deleteSupabaseCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
