-- İş Takip SaaS — ilk PostgreSQL/Supabase şeması
-- Multi-tenant temel: her işletme verisi company_id ile ayrılır.
-- Kimlik doğrulama Supabase Auth üzerinden yapılır.

create extension if not exists pgcrypto;

create type public.app_role as enum ('yonetici', 'yardimci', 'calisan');
create type public.job_status as enum ('yeni', 'planlandi', 'devam', 'beklemede', 'kontrolde', 'tamamlandi', 'iptal');
create type public.priority as enum ('yuksek', 'orta', 'dusuk');
create type public.project_status as enum ('planlandi', 'devam', 'beklemede', 'tamamlandi', 'iptal');
create type public.transaction_type as enum ('gelir', 'gider');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null,
  department_id uuid,
  position text not null default '',
  start_date date not null default current_date,
  active boolean not null default true,
  role public.app_role not null default 'calisan',
  color text not null default '#2563eb',
  unique (company_id, email)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  unique (company_id, name)
);

alter table public.employees
  add constraint employees_department_fk
  foreign key (department_id) references public.departments(id) on delete set null;

create table public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  email text not null,
  role public.app_role not null,
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create index user_accounts_company_idx on public.user_accounts(company_id);
create index user_accounts_auth_user_idx on public.user_accounts(auth_user_id);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  company_name text not null,
  contact text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  tax_office text not null default '',
  tax_no text not null default '',
  note text not null default '',
  tags text[] not null default '{}',
  status text not null default 'aktif' check (status in ('aktif', 'pasif'))
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  customer_id uuid references public.customers(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status public.project_status not null default 'planlandi',
  budget numeric(14,2) not null default 0,
  note text not null default ''
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null default '',
  customer_id uuid references public.customers(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.employees(id) on delete set null,
  start_date date not null,
  due_date date not null,
  time text not null default '',
  priority public.priority not null default 'orta',
  status public.job_status not null default 'yeni',
  fee numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  tags text[] not null default '{}',
  note text not null default '',
  subtasks jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index jobs_company_idx on public.jobs(company_id);
create index jobs_assignee_idx on public.jobs(company_id, assignee_id);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  date date not null,
  time text not null,
  participant_ids uuid[] not null default '{}',
  customer_id uuid references public.customers(id) on delete set null,
  location text not null default '',
  description text not null default '',
  note text not null default ''
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type public.transaction_type not null,
  description text not null,
  amount numeric(14,2) not null default 0,
  date date not null,
  customer_id uuid references public.customers(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  category text not null default ''
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  text text not null,
  kind text not null default 'info' check (kind in ('info', 'uyari')),
  created_at timestamptz not null default now(),
  read boolean not null default false,
  job_id uuid references public.jobs(id) on delete cascade
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.user_accounts(id) on delete set null,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.company_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  company_name text not null,
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  currency text not null default 'TRY' check (currency = 'TRY'),
  theme text not null default 'light' check (theme in ('light', 'dark'))
);

create table public.system_admins (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ua.company_id
  from public.user_accounts ua
  where ua.auth_user_id = auth.uid()
    and ua.active = true
  limit 1
$$;

revoke all on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated;

alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.departments enable row level security;
alter table public.user_accounts enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.jobs enable row level security;
alter table public.meetings enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.activities enable row level security;
alter table public.company_settings enable row level security;
alter table public.system_admins enable row level security;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select ua.role
  from public.user_accounts ua
  where ua.auth_user_id = (select auth.uid())
    and ua.active = true
  limit 1
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create policy companies_select_own on public.companies
  for select to authenticated
  using (id = (select public.current_company_id()));

create policy employees_select_tenant on public.employees
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy employees_insert_admin on public.employees
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy employees_update_admin on public.employees
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy employees_delete_admin on public.employees
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy departments_select_tenant on public.departments
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy departments_insert_admin on public.departments
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy departments_update_admin on public.departments
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy departments_delete_admin on public.departments
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

create policy user_accounts_select_tenant on public.user_accounts
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy customers_select_tenant on public.customers
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy customers_insert_manager on public.customers
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy customers_update_manager on public.customers
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy customers_delete_manager on public.customers
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy projects_select_tenant on public.projects
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy projects_insert_manager on public.projects
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy projects_update_manager on public.projects
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy projects_delete_manager on public.projects
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy jobs_select_tenant on public.jobs
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy jobs_insert_manager on public.jobs
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy jobs_update_manager on public.jobs
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy jobs_delete_manager on public.jobs
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy meetings_select_tenant on public.meetings
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy meetings_insert_manager on public.meetings
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy meetings_update_manager on public.meetings
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy meetings_delete_manager on public.meetings
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy transactions_select_tenant on public.transactions
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy transactions_insert_manager on public.transactions
  for insert to authenticated
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy transactions_update_manager on public.transactions
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy transactions_delete_manager on public.transactions
  for delete to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) in ('yonetici', 'yardimci')
  );

create policy notifications_select_tenant on public.notifications
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy activities_select_tenant on public.activities
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy company_settings_select_tenant on public.company_settings
  for select to authenticated
  using (company_id = (select public.current_company_id()));

create policy company_settings_update_admin on public.company_settings
  for update to authenticated
  using (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  )
  with check (
    company_id = (select public.current_company_id())
    and (select public.current_user_role()) = 'yonetici'
  );

revoke all on table public.system_admins from anon, authenticated;
