import type { DB, Employee, Job, Meeting, NotificationItem, Project, Customer, Transaction, ActivityItem, Department, UserAccount, CompanySettings } from '@/types/models';
import { supabase } from '@/lib/supabase';

type Row = Record<string, any>;

const mapEmployee = (r: Row): Employee => ({
  id: r.id, name: r.name, phone: r.phone ?? '', email: r.email ?? '',
  departmentId: r.department_id ?? '', position: r.position ?? '',
  startDate: r.start_date, active: r.active, role: r.role, color: r.color ?? '#2563eb',
});
const mapCustomer = (r: Row): Customer => ({
  companyId: r.company_id, id: r.id, company: r.company_name, contact: r.contact ?? '',
  phone: r.phone ?? '', email: r.email ?? '', address: r.address ?? '',
  taxOffice: r.tax_office ?? '', taxNo: r.tax_no ?? '', note: r.note ?? '',
  tags: r.tags ?? [], status: r.status,
});
const mapProject = (r: Row): Project => ({
  companyId: r.company_id, id: r.id, name: r.name, customerId: r.customer_id,
  startDate: r.start_date, endDate: r.end_date, status: r.status,
  budget: Number(r.budget ?? 0), note: r.note ?? '',
});
const mapJob = (r: Row): Job => ({
  companyId: r.company_id, id: r.id, title: r.title, description: r.description ?? '',
  customerId: r.customer_id, projectId: r.project_id, assigneeId: r.assignee_id,
  startDate: r.start_date, dueDate: r.due_date, time: r.time ?? '',
  priority: r.priority, status: r.status, fee: Number(r.fee ?? 0), cost: Number(r.cost ?? 0),
  tags: r.tags ?? [], note: r.note ?? '', subtasks: r.subtasks ?? [],
  comments: r.comments ?? [], files: r.files ?? [], createdAt: r.created_at, completedAt: r.completed_at,
});
const mapMeeting = (r: Row): Meeting => ({
  companyId: r.company_id, id: r.id, title: r.title, date: r.date, time: r.time,
  participantIds: r.participant_ids ?? [], customerId: r.customer_id, location: r.location ?? '',
  description: r.description ?? '', note: r.note ?? '',
});
const mapTransaction = (r: Row): Transaction => ({
  companyId: r.company_id, id: r.id, type: r.type, description: r.description,
  amount: Number(r.amount ?? 0), date: r.date, customerId: r.customer_id,
  projectId: r.project_id, category: r.category ?? '',
});
const mapNotification = (r: Row): NotificationItem => ({
  companyId: r.company_id, id: r.id, text: r.text, kind: r.kind,
  createdAt: r.created_at, read: r.read, ...(r.job_id ? { jobId: r.job_id } : {}),
});
const mapActivity = (r: Row, accounts: UserAccount[]): ActivityItem => ({
  companyId: r.company_id, id: r.id,
  userId: accounts.find((a) => a.id === r.user_id)?.employeeId ?? r.user_id,
  text: r.text, createdAt: r.created_at,
});

async function readTable<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function loadSupabaseDB(): Promise<DB | null> {
  const [companies, departments, employees, accounts, customers, projects, jobs, meetings, transactions, notifications, activities, settings] =
    await Promise.all([
      readTable<Row>('companies'), readTable<Row>('departments'), readTable<Row>('employees'),
      readTable<Row>('user_accounts'), readTable<Row>('customers'), readTable<Row>('projects'),
      readTable<Row>('jobs'), readTable<Row>('meetings'), readTable<Row>('transactions'),
      readTable<Row>('notifications'), readTable<Row>('activities'), readTable<Row>('company_settings'),
    ]);

  const company = companies[0];
  if (!company) return null;

  const userAccounts: UserAccount[] = accounts.map((r) => ({
    id: r.id, companyId: r.company_id, employeeId: r.employee_id, email: r.email,
    role: r.role, active: r.active, lastLoginAt: r.last_login_at, createdAt: r.created_at,
  }));

  const setting = settings.find((r) => r.company_id === company.id);
  const companySettings: CompanySettings = {
    companyName: setting?.company_name ?? company.name, phone: setting?.phone ?? '',
    email: setting?.email ?? '', address: setting?.address ?? '', currency: 'TRY',
    theme: setting?.theme === 'dark' ? 'dark' : 'light',
  };

  return {
    company: { id: company.id, name: company.name, slug: company.slug, active: company.active, createdAt: company.created_at },
    userAccounts,
    departments: departments.map((r) => ({ id: r.id, name: r.name } as Department)),
    employees: employees.map(mapEmployee),
    customers: customers.map(mapCustomer),
    projects: projects.map(mapProject),
    jobs: jobs.map(mapJob),
    meetings: meetings.map(mapMeeting),
    transactions: transactions.map(mapTransaction),
    notifications: notifications.map(mapNotification),
    activities: activities.map((r) => mapActivity(r, userAccounts)),
    settings: companySettings,
  };
}
