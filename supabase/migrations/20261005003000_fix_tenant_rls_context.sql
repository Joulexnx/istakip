-- Ensure tenant RLS resolves the company through the already-verified account RPC.
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ua.company_id
  from public.get_my_account() ua
  limit 1
$$;

revoke all on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated;
