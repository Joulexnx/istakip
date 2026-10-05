-- Allow authenticated managers to mutate customers through the existing tenant RLS boundary.
grant insert, update, delete on table public.customers to authenticated;
