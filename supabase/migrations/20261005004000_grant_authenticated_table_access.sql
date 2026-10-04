-- Supabase PostgREST needs table privileges before RLS policies can filter rows.
-- RLS remains the tenant/role security boundary.
grant select, insert, update, delete on table
  public.companies,
  public.employees,
  public.departments,
  public.user_accounts,
  public.customers,
  public.projects,
  public.jobs,
  public.meetings,
  public.transactions,
  public.notifications,
  public.activities,
  public.company_settings
to authenticated;

-- Companies and user_accounts are intentionally read-only from the browser;
-- their RLS policies still control visibility.
revoke insert, update, delete on table public.companies from authenticated;
revoke insert, update, delete on table public.user_accounts from authenticated;
