import { supabase } from '@/lib/supabase';
import type { Job, JobComment, JobStatus, SubTask } from '@/types/models';

type JobRow = Record<string, unknown>;

const mapJob = (r: JobRow): Job => ({
  companyId: String(r.company_id),
  id: String(r.id),
  title: String(r.title),
  description: String(r.description ?? ''),
  customerId: String(r.customer_id),
  projectId: r.project_id ? String(r.project_id) : null,
  assigneeId: String(r.assignee_id),
  startDate: String(r.start_date),
  dueDate: String(r.due_date),
  time: String(r.time ?? ''),
  priority: r.priority as Job['priority'],
  status: r.status as JobStatus,
  fee: Number(r.fee ?? 0),
  cost: Number(r.cost ?? 0),
  tags: (r.tags ?? []) as string[],
  note: String(r.note ?? ''),
  subtasks: (r.subtasks ?? []) as SubTask[],
  comments: (r.comments ?? []) as JobComment[],
  files: (r.files ?? []) as Job['files'],
  createdAt: String(r.created_at),
  completedAt: r.completed_at ? String(r.completed_at) : null,
});

function requireRow(data: JobRow | null, error: { message: string } | null): Job {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('İş verisi alınamadı.');
  return mapJob(data);
}

export async function insertSupabaseJob(job: Job): Promise<Job> {
  const { data, error } = await supabase.from('jobs').insert({
    id: job.id,
    company_id: job.companyId,
    title: job.title,
    description: job.description,
    customer_id: job.customerId,
    project_id: job.projectId,
    assignee_id: job.assigneeId,
    start_date: job.startDate,
    due_date: job.dueDate,
    time: job.time,
    priority: job.priority,
    status: job.status,
    fee: job.fee,
    cost: job.cost,
    tags: job.tags,
    note: job.note,
    subtasks: job.subtasks,
    comments: job.comments,
    files: job.files,
    created_at: job.createdAt,
    completed_at: job.completedAt,
  }).select('*').single();

  return requireRow(data as JobRow | null, error);
}

export async function updateSupabaseJob(id: string, patch: Partial<Job>): Promise<Job> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.customerId !== undefined) row.customer_id = patch.customerId;
  if (patch.projectId !== undefined) row.project_id = patch.projectId;
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
  if (patch.time !== undefined) row.time = patch.time;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.fee !== undefined) row.fee = patch.fee;
  if (patch.cost !== undefined) row.cost = patch.cost;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.subtasks !== undefined) row.subtasks = patch.subtasks;
  if (patch.comments !== undefined) row.comments = patch.comments;
  if (patch.files !== undefined) row.files = patch.files;
  if (patch.completedAt !== undefined) row.completed_at = patch.completedAt;

  const { data, error } = await supabase.from('jobs').update(row).eq('id', id).select('*').single();
  return requireRow(data as JobRow | null, error);
}

export async function deleteSupabaseJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function rpcJob(name: string, args: Record<string, unknown>): Promise<Job> {
  const { data, error } = await supabase.rpc(name, args);
  return requireRow(data as JobRow | null, error);
}

export function setSupabaseJobStatus(id: string, status: JobStatus): Promise<Job> {
  return rpcJob('set_job_status', { p_job_id: id, p_status: status });
}

export function toggleSupabaseSubtask(jobId: string, subtaskId: string): Promise<Job> {
  return rpcJob('toggle_job_subtask', { p_job_id: jobId, p_subtask_id: subtaskId });
}

export function addSupabaseSubtask(jobId: string, title: string): Promise<Job> {
  return rpcJob('add_job_subtask', { p_job_id: jobId, p_title: title });
}

export function addSupabaseComment(jobId: string, text: string): Promise<Job> {
  return rpcJob('add_job_comment', { p_job_id: jobId, p_text: text });
}

export function addSupabaseFile(jobId: string, name: string, kind: string): Promise<Job> {
  return rpcJob('add_job_file', { p_job_id: jobId, p_name: name, p_kind: kind });
}
