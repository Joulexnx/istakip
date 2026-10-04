-- Job mutation RPCs: keep job writes tenant-scoped and allow assigned employees
-- to perform the same safe mutations the UI already permits.

create or replace function public.set_job_status(
  p_job_id uuid,
  p_status public.job_status
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_employee_id uuid;
  v_role public.app_role;
  v_job public.jobs;
begin
  select ua.company_id, ua.employee_id, ua.role
    into v_company_id, v_employee_id, v_role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1;

  if v_company_id is null then
    raise exception 'Aktif şirket hesabı bulunamadı';
  end if;

  update public.jobs
     set status = p_status,
         completed_at = case when p_status = 'tamamlandi' then now() else null end
   where id = p_job_id
     and company_id = v_company_id
     and (
       v_role in ('yonetici', 'yardimci')
       or assignee_id = v_employee_id
     )
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Bu iş için değişiklik yetkiniz yok';
  end if;

  return v_job;
end;
$$;

create or replace function public.toggle_job_subtask(
  p_job_id uuid,
  p_subtask_id text
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_employee_id uuid;
  v_role public.app_role;
  v_job public.jobs;
begin
  select ua.company_id, ua.employee_id, ua.role
    into v_company_id, v_employee_id, v_role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1;

  update public.jobs
     set subtasks = coalesce((
       select jsonb_agg(
         case
           when elem->>'id' = p_subtask_id
           then elem || jsonb_build_object('done', not coalesce((elem->>'done')::boolean, false))
           else elem
         end
       )
       from jsonb_array_elements(coalesce(subtasks, '[]'::jsonb)) elem
     ), '[]'::jsonb)
   where id = p_job_id
     and company_id = v_company_id
     and (
       v_role in ('yonetici', 'yardimci')
       or assignee_id = v_employee_id
     )
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Bu iş için değişiklik yetkiniz yok';
  end if;

  return v_job;
end;
$$;

create or replace function public.add_job_subtask(
  p_job_id uuid,
  p_title text
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_employee_id uuid;
  v_role public.app_role;
  v_job public.jobs;
begin
  select ua.company_id, ua.employee_id, ua.role
    into v_company_id, v_employee_id, v_role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1;

  update public.jobs
     set subtasks = coalesce(subtasks, '[]'::jsonb) || jsonb_build_array(
       jsonb_build_object(
         'id', public.gen_random_uuid()::text,
         'title', trim(p_title),
         'done', false
       )
     )
   where id = p_job_id
     and company_id = v_company_id
     and trim(p_title) <> ''
     and (
       v_role in ('yonetici', 'yardimci')
       or assignee_id = v_employee_id
     )
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Bu iş için değişiklik yetkiniz yok';
  end if;

  return v_job;
end;
$$;

create or replace function public.add_job_comment(
  p_job_id uuid,
  p_text text
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_employee_id uuid;
  v_role public.app_role;
  v_job public.jobs;
begin
  select ua.company_id, ua.employee_id, ua.role
    into v_company_id, v_employee_id, v_role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1;

  if v_employee_id is null then
    raise exception 'Aktif çalışan hesabı bulunamadı';
  end if;

  update public.jobs
     set comments = coalesce(comments, '[]'::jsonb) || jsonb_build_array(
       jsonb_build_object(
         'id', public.gen_random_uuid()::text,
         'userId', v_employee_id::text,
         'text', trim(p_text),
         'createdAt', now()
       )
     )
   where id = p_job_id
     and company_id = v_company_id
     and trim(p_text) <> ''
     and (
       v_role in ('yonetici', 'yardimci')
       or assignee_id = v_employee_id
     )
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Bu iş için yorum yetkiniz yok';
  end if;

  return v_job;
end;
$$;

create or replace function public.add_job_file(
  p_job_id uuid,
  p_name text,
  p_kind text
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
  v_employee_id uuid;
  v_role public.app_role;
  v_job public.jobs;
begin
  select ua.company_id, ua.employee_id, ua.role
    into v_company_id, v_employee_id, v_role
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1;

  update public.jobs
     set files = coalesce(files, '[]'::jsonb) || jsonb_build_array(
       jsonb_build_object(
         'id', public.gen_random_uuid()::text,
         'name', trim(p_name),
         'kind', p_kind
       )
     )
   where id = p_job_id
     and company_id = v_company_id
     and trim(p_name) <> ''
     and (
       v_role in ('yonetici', 'yardimci')
       or assignee_id = v_employee_id
     )
  returning * into v_job;

  if v_job.id is null then
    raise exception 'Bu iş için dosya ekleme yetkiniz yok';
  end if;

  return v_job;
end;
$$;

revoke all on function public.set_job_status(uuid, public.job_status) from public, anon;
revoke all on function public.toggle_job_subtask(uuid, text) from public, anon;
revoke all on function public.add_job_subtask(uuid, text) from public, anon;
revoke all on function public.add_job_comment(uuid, text) from public, anon;
revoke all on function public.add_job_file(uuid, text, text) from public, anon;

grant execute on function public.set_job_status(uuid, public.job_status) to authenticated;
grant execute on function public.toggle_job_subtask(uuid, text) to authenticated;
grant execute on function public.add_job_subtask(uuid, text) to authenticated;
grant execute on function public.add_job_comment(uuid, text) to authenticated;
grant execute on function public.add_job_file(uuid, text, text) to authenticated;
