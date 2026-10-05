import { supabase } from '@/lib/supabase';
import type { Project, ProjectStatus } from '@/types/models';

type ProjectRow = Record<string, unknown>;

const mapProject = (r: ProjectRow): Project => ({
  companyId: String(r.company_id),
  id: String(r.id),
  name: String(r.name),
  customerId: String(r.customer_id),
  startDate: String(r.start_date),
  endDate: String(r.end_date),
  status: r.status as ProjectStatus,
  budget: Number(r.budget ?? 0),
  note: String(r.note ?? ''),
});

function requireProject(data: ProjectRow | null, error: { message: string } | null): Project {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Proje verisi alınamadı.');
  return mapProject(data);
}

export async function insertSupabaseProject(project: Project): Promise<Project> {
  const { data, error } = await supabase.from('projects').insert({
    id: project.id,
    company_id: project.companyId,
    name: project.name,
    customer_id: project.customerId,
    start_date: project.startDate,
    end_date: project.endDate,
    status: project.status,
    budget: project.budget,
    note: project.note,
  }).select('*').single();

  return requireProject(data as ProjectRow | null, error);
}

export async function updateSupabaseProject(id: string, patch: Partial<Project>): Promise<Project> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.customerId !== undefined) row.customer_id = patch.customerId;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.budget !== undefined) row.budget = patch.budget;
  if (patch.note !== undefined) row.note = patch.note;

  const { data, error } = await supabase.from('projects').update(row).eq('id', id).select('*').single();
  return requireProject(data as ProjectRow | null, error);
}

export async function deleteSupabaseProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
