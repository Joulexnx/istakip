-- Make company lookup reuse the same authenticated account resolution as get_my_account().
create or replace function public.get_my_company()
returns table (
  id uuid,
  name text,
  slug text,
  active boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.name, c.slug, c.active, c.created_at
  from public.companies c
  inner join public.get_my_account() ua on ua.company_id = c.id
  where ua.active = true
  limit 1
$$;

revoke all on function public.get_my_company() from public;
grant execute on function public.get_my_company() to authenticated;
