// Uygulama veri modelleri — ileride backend'e taşınabilecek şekilde UI'dan bağımsız tanımlanmıştır.

export type Role = 'yonetici' | 'yardimci' | 'calisan';

export const ROLE_LABELS: Record<Role, string> = {
  yonetici: 'Yönetici',
  yardimci: 'Yönetici Yardımcısı',
  calisan: 'Çalışan',
};

export type JobStatus =
  | 'yeni'
  | 'planlandi'
  | 'devam'
  | 'beklemede'
  | 'kontrolde'
  | 'tamamlandi'
  | 'iptal';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  yeni: 'Yeni',
  planlandi: 'Planlandı',
  devam: 'Devam Ediyor',
  beklemede: 'Beklemede',
  kontrolde: 'Kontrolde',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
};

export const JOB_STATUS_ORDER: JobStatus[] = [
  'yeni',
  'planlandi',
  'devam',
  'beklemede',
  'kontrolde',
  'tamamlandi',
  'iptal',
];

export type Priority = 'yuksek' | 'orta' | 'dusuk';

export const PRIORITY_LABELS: Record<Priority, string> = {
  yuksek: 'Yüksek',
  orta: 'Orta',
  dusuk: 'Düşük',
};

export type ProjectStatus = 'planlandi' | 'devam' | 'beklemede' | 'tamamlandi' | 'iptal';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planlandi: 'Planlandı',
  devam: 'Devam Ediyor',
  beklemede: 'Beklemede',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
};


export interface Company {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  companyId: string;
  employeeId: string | null;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  departmentId: string;
  position: string;
  startDate: string; // ISO yyyy-mm-dd
  active: boolean;
  role: Role;
  color: string; // avatar rengi
}

export interface Customer {
  companyId: string;
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  taxOffice: string;
  taxNo: string;
  note: string;
  tags: string[];
  status: 'aktif' | 'pasif';
}

export interface Project {
  companyId: string;
  id: string;
  name: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  note: string;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface JobComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string; // ISO datetime
}

export interface JobFile {
  id: string;
  name: string;
  kind: 'pdf' | 'jpg' | 'png' | 'docx' | 'xlsx' | 'diger';
}

export interface Job {
  companyId: string;
  id: string;
  title: string;
  description: string;
  customerId: string;
  projectId: string | null;
  assigneeId: string;
  startDate: string; // ISO date
  dueDate: string; // ISO date
  time: string; // "10:00"
  priority: Priority;
  status: JobStatus;
  fee: number;
  cost: number;
  tags: string[];
  note: string;
  subtasks: SubTask[];
  comments: JobComment[];
  files: JobFile[];
  createdAt: string;
  completedAt: string | null;
}

export interface Meeting {
  companyId: string;
  id: string;
  title: string;
  date: string;
  time: string;
  participantIds: string[];
  customerId: string | null;
  location: string;
  description: string;
  note: string;
}

export type TransactionType = 'gelir' | 'gider';

export interface Transaction {
  companyId: string;
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  customerId: string | null;
  projectId: string | null;
  category: string;
}

export interface NotificationItem {
  companyId: string;
  id: string;
  text: string;
  kind: 'info' | 'uyari';
  createdAt: string;
  read: boolean;
  jobId?: string;
}

export interface ActivityItem {
  companyId: string;
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  currency: 'TRY';
  theme: 'light' | 'dark';
}

export interface DB {
  company: Company;
  userAccounts: UserAccount[];
  departments: Department[];
  employees: Employee[];
  customers: Customer[];
  projects: Project[];
  jobs: Job[];
  meetings: Meeting[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  settings: CompanySettings;
}