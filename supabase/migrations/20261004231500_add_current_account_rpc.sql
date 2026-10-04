create or replace function public.get_my_account()
returns table (
  id uuid,
  company_id uuid,
  employee_id uuid,
  email text,
  role public.app_role,
  active boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ua.id,
    ua.company_id,
    ua.employee_id,
    ua.email,
    ua.role,
    ua.active
  from public.user_accounts ua
  where ua.auth_user_id = (select auth.uid())
    and ua.active = true
  limit 1
$$;

revoke all on function public.get_my_account() from public;
grant execute on function public.get_my_account() to authenticated;
