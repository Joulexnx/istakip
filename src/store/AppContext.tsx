import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ActivityItem,
  CompanySettings,
  Customer,
  DB,
  Employee,
  Job,
  JobComment,
  JobStatus,
  Meeting,
  NotificationItem,
  Project,
  Role,
  SubTask,
  Transaction,
} from '@/types/models';
import { clearDB, exportDB, loadDB, resetDB, saveDB } from '@/services/storage';
import { uid } from '@/lib/format';
import { isBackendAuthEnabled, loginWithBackend, logoutFromBackend } from '@/services/auth';

interface AppContextValue {
  db: DB;
  currentUserId: string;
  currentRole: Role;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  setCurrentUserId: (id: string) => void;
  // yardımcılar
  employee: (id: string | null | undefined) => Employee | undefined;
  customer: (id: string | null | undefined) => Customer | undefined;
  project: (id: string | null | undefined) => Project | undefined;
  // işler
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'completedAt' | 'comments' | 'files' | 'subtasks'> & { subtasks?: SubTask[] }) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  toggleSubtask: (jobId: string, subId: string) => void;
  addSubtask: (jobId: string, title: string) => void;
  addComment: (jobId: string, text: string) => void;
  addFile: (jobId: string, name: string) => void;
  // projeler / çalışanlar / müşteriler
  addProject: (p: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addEmployee: (e: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addDepartment: (name: string) => void;
  // toplantılar
  addMeeting: (m: Omit<Meeting, 'id'>) => Meeting;
  deleteMeeting: (id: string) => void;
  // finans
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  // bildirim & aktivite
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  logActivity: (text: string) => void;
  notify: (text: string, kind?: NotificationItem['kind'], jobId?: string) => void;
  // ayarlar
  updateSettings: (patch: Partial<CompanySettings>) => void;
  resetDemo: () => void;
  clearAllData: () => void;
  exportData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const USER_KEY = 'sits_current_user';
const AUTH_KEY = 'sits_authenticated';
const DEMO_PASSWORD = '123456';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB());
  const [currentUserId, setCurrentUserIdState] = useState<string>(() => localStorage.getItem(USER_KEY) || 'emp_ahmet');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem(AUTH_KEY) === '1');

  useEffect(() => saveDB(db), [db]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', db.settings.theme === 'dark');
  }, [db.settings.theme]);

  const setCurrentUserId = useCallback((id: string) => {
    localStorage.setItem(USER_KEY, id);
    setCurrentUserIdState(id);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLocaleLowerCase('tr-TR');

    if (isBackendAuthEnabled) {
      try {
        const result = await loginWithBackend(normalized, password);
        const user = db.employees.find((e) => e.id === result.userId && e.active);
        if (!user) return { ok: false, message: 'Sunucu kullanıcıyı doğruladı ancak yerel kullanıcı kaydı bulunamadı.' };
        localStorage.setItem(USER_KEY, user.id);
        localStorage.setItem(AUTH_KEY, '1');
        setCurrentUserIdState(user.id);
        setIsAuthenticated(true);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Sunucuya giriş yapılamadı.' };
      }
    }

    const user = db.employees.find((e) => e.email.toLocaleLowerCase('tr-TR') === normalized && e.active);
    if (!user) return { ok: false, message: 'Aktif kullanıcı bulunamadı.' };
    if (password !== DEMO_PASSWORD) return { ok: false, message: 'Şifre hatalı. Demo şifre: 123456' };
    localStorage.setItem(USER_KEY, user.id);
    localStorage.setItem(AUTH_KEY, '1');
    setCurrentUserIdState(user.id);
    setIsAuthenticated(true);
    return { ok: true };
  }, [db.employees]);

  const logout = useCallback(async () => {
    try {
      await logoutFromBackend();
    } catch {
      // Yerel oturum yine de kapatılır.
    }
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
  }, []);

  const currentUser = db.employees.find((e) => e.id === currentUserId);
  const currentRole: Role = currentUser?.role ?? 'calisan';

  useEffect(() => {
    if (isAuthenticated && (!currentUser || !currentUser.active)) {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      setIsAuthenticated(false);
    }
  }, [isAuthenticated, currentUser]);
  const canManage = currentRole === 'yonetici' || currentRole === 'yardimci';
  const canAdmin = currentRole === 'yonetici';
  const canAccessJob = useCallback(
    (job?: Job) => Boolean(job && (canManage || (currentRole === 'calisan' && job.assigneeId === currentUserId))),
    [canManage, currentRole, currentUserId]
  );

  const employee = useCallback((id?: string | null) => db.employees.find((e) => e.id === id), [db.employees]);
  const customer = useCallback((id?: string | null) => db.customers.find((c) => c.id === id), [db.customers]);
  const project = useCallback((id?: string | null) => db.projects.find((p) => p.id === id), [db.projects]);

  const mutate = useCallback((fn: (d: DB) => DB) => setDb((prev) => fn(prev)), []);

  const pushActivity = (d: DB, text: string): DB => {
    const item: ActivityItem = { id: uid('ac'), userId: currentUserId, text, createdAt: new Date().toISOString() };
    return { ...d, activities: [item, ...d.activities].slice(0, 200) };
  };

  const pushNotification = (d: DB, text: string, kind: NotificationItem['kind'] = 'info', jobId?: string): DB => {
    const item: NotificationItem = { id: uid('nt'), text, kind, createdAt: new Date().toISOString(), read: false, jobId };
    return { ...d, notifications: [item, ...d.notifications].slice(0, 100) };
  };

  // ---- İşler ----
  const addJob: AppContextValue['addJob'] = useCallback(
    (input) => {
      if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
      const job: Job = {
        subtasks: [],
        ...input,
        id: uid('job'),
        comments: [],
        files: [],
        createdAt: new Date().toISOString(),
        completedAt: input.status === 'tamamlandi' ? new Date().toISOString() : null,
      };
      mutate((d) => {
        let nd = { ...d, jobs: [job, ...d.jobs] };
        nd = pushActivity(nd, `"${job.title}" işini oluşturdu.`);
        const assignee = nd.employees.find((e) => e.id === job.assigneeId);
        if (assignee) nd = pushNotification(nd, `${assignee.name} kişisine yeni iş atandı: "${job.title}"`, 'info', job.id);
        return nd;
      });
      return job;
    },
    [mutate, canManage]
  );

  const updateJob = useCallback(
    (id: string, patch: Partial<Job>) => {
      if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
      mutate((d) => ({ ...d, jobs: d.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) }));
    },
    [mutate, canManage]
  );

  const deleteJob = useCallback(
    (id: string) => {
      if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
      mutate((d) => {
        const job = d.jobs.find((j) => j.id === id);
        let nd: DB = { ...d, jobs: d.jobs.filter((j) => j.id !== id) };
        if (job) nd = pushActivity(nd, `"${job.title}" işini sildi.`);
        return nd;
      });
    },
    [mutate, canManage]
  );

  const setJobStatus = useCallback(
    (id: string, status: JobStatus) => {
      const target = db.jobs.find((j) => j.id === id);
      if (!canAccessJob(target)) throw new Error('Bu işe erişim yetkiniz yok.');
      mutate((d) => {
        const job = d.jobs.find((j) => j.id === id);
        if (!job || job.status === status) return d;
        let nd: DB = {
          ...d,
          jobs: d.jobs.map((j) =>
            j.id === id ? { ...j, status, completedAt: status === 'tamamlandi' ? new Date().toISOString() : null } : j
          ),
        };
        nd = pushActivity(nd, `"${job.title}" işinin durumunu değiştirdi.`);
        return nd;
      });
    },
    [mutate, db.jobs, canAccessJob]
  );

  const toggleSubtask = useCallback(
    (jobId: string, subId: string) => {
      const target = db.jobs.find((j) => j.id === jobId);
      if (!canAccessJob(target)) throw new Error('Bu işe erişim yetkiniz yok.');
      mutate((d) => ({
        ...d,
        jobs: d.jobs.map((j) =>
          j.id === jobId
            ? { ...j, subtasks: j.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) }
            : j
        ),
      }));
    },
    [mutate, db.jobs, canAccessJob]
  );

  const addSubtask = useCallback(
    (jobId: string, title: string) => {
      const target = db.jobs.find((j) => j.id === jobId);
      if (!canAccessJob(target)) throw new Error('Bu işe erişim yetkiniz yok.');
      mutate((d) => ({
        ...d,
        jobs: d.jobs.map((j) =>
          j.id === jobId ? { ...j, subtasks: [...j.subtasks, { id: uid('sub'), title, done: false }] } : j
        ),
      }));
    },
    [mutate, db.jobs, canAccessJob]
  );

  const addComment = useCallback(
    (jobId: string, text: string) => {
      const target = db.jobs.find((j) => j.id === jobId);
      if (!canAccessJob(target)) throw new Error('Bu işe erişim yetkiniz yok.');
      mutate((d) => {
        const job = d.jobs.find((j) => j.id === jobId);
        const comment: JobComment = { id: uid('cm'), userId: currentUserId, text, createdAt: new Date().toISOString() };
        let nd: DB = { ...d, jobs: d.jobs.map((j) => (j.id === jobId ? { ...j, comments: [...j.comments, comment] } : j)) };
        nd = pushActivity(nd, `"${job?.title ?? 'İş'}" işine yorum ekledi.`);
        nd = pushNotification(nd, `"${job?.title ?? 'İş'}" işine yeni bir yorum eklendi.`, 'info', jobId);
        return nd;
      });
    },
    [mutate, currentUserId, db.jobs, canAccessJob]
  );

  const addFile = useCallback(
    (jobId: string, name: string) => {
      const target = db.jobs.find((j) => j.id === jobId);
      if (!canAccessJob(target)) throw new Error('Bu işe erişim yetkiniz yok.');
      const ext = name.split('.').pop()?.toLowerCase() ?? '';
      const kind = (['pdf', 'jpg', 'png', 'docx', 'xlsx'] as const).includes(ext as never) ? (ext as 'pdf') : 'diger';
      mutate((d) => {
        const job = d.jobs.find((j) => j.id === jobId);
        let nd: DB = {
          ...d,
          jobs: d.jobs.map((j) => (j.id === jobId ? { ...j, files: [...j.files, { id: uid('f'), name, kind }] } : j)),
        };
        nd = pushActivity(nd, `"${job?.title ?? 'İş'}" işine dosya ekledi (${name}).`);
        return nd;
      });
    },
    [mutate, db.jobs, canAccessJob]
  );

  // ---- Projeler ----
  const addProject = useCallback((p: Omit<Project, 'id'>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    const np: Project = { ...p, id: uid('prj') };
    mutate((d) => pushActivity({ ...d, projects: [np, ...d.projects] }, `"${np.name}" projesini oluşturdu.`));
    return np;
  }, [mutate, canManage]);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, [mutate, canManage]);

  const deleteProject = useCallback((id: string) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  }, [mutate, canManage]);

  // ---- Çalışanlar ----
  const addEmployee = useCallback((e: Omit<Employee, 'id'>) => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    const ne: Employee = { ...e, id: uid('emp') };
    mutate((d) => pushActivity({ ...d, employees: [...d.employees, ne] }, `${ne.name} adlı çalışanı ekledi.`));
    return ne;
  }, [mutate, canAdmin]);

  const updateEmployee = useCallback((id: string, patch: Partial<Employee>) => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    mutate((d) => ({ ...d, employees: d.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }, [mutate, canAdmin]);

  const deleteEmployee = useCallback((id: string) => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    mutate((d) => ({ ...d, employees: d.employees.filter((e) => e.id !== id) }));
  }, [mutate, canAdmin]);

  // ---- Müşteriler ----
  const addCustomer = useCallback((c: Omit<Customer, 'id'>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    const nc: Customer = { ...c, id: uid('cus') };
    mutate((d) => pushActivity({ ...d, customers: [nc, ...d.customers] }, `"${nc.company}" müşterisini ekledi.`));
    return nc;
  }, [mutate, canManage]);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, customers: d.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, [mutate, canManage]);

  const deleteCustomer = useCallback((id: string) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }));
  }, [mutate, canManage]);

  const addDepartment = useCallback((name: string) => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    mutate((d) => ({ ...d, departments: [...d.departments, { id: uid('dep'), name }] }));
  }, [mutate, canAdmin]);

  // ---- Toplantılar ----
  const addMeeting = useCallback((m: Omit<Meeting, 'id'>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    const nm: Meeting = { ...m, id: uid('mt') };
    mutate((d) => pushActivity({ ...d, meetings: [...d.meetings, nm] }, `"${nm.title}" toplantısını oluşturdu.`));
    return nm;
  }, [mutate, canManage]);

  const deleteMeeting = useCallback((id: string) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, meetings: d.meetings.filter((m) => m.id !== id) }));
  }, [mutate, canManage]);

  // ---- Finans ----
  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => {
      const nt: Transaction = { ...t, id: uid('tr') };
      return pushActivity(
        { ...d, transactions: [nt, ...d.transactions] },
        `${t.type === 'gelir' ? 'Gelir' : 'Gider'} kaydı ekledi: ${t.description}`
      );
    });
  }, [mutate, canManage]);

  const deleteTransaction = useCallback((id: string) => {
    if (!canManage) throw new Error('Bu işlem için yönetici yetkisi gereklidir.');
    mutate((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, [mutate, canManage]);

  // ---- Bildirim / aktivite ----
  const markNotificationRead = useCallback((id: string) => {
    mutate((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }, [mutate]);

  const markAllNotificationsRead = useCallback(() => {
    mutate((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
  }, [mutate]);

  const logActivity = useCallback((text: string) => {
    mutate((d) => pushActivity(d, text));
  }, [mutate]);

  const notify = useCallback((text: string, kind: NotificationItem['kind'] = 'info', jobId?: string) => {
    mutate((d) => pushNotification(d, text, kind, jobId));
  }, [mutate]);

  // ---- Ayarlar ----
  const updateSettings = useCallback((patch: Partial<CompanySettings>) => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, [mutate, canAdmin]);

  const resetDemo = useCallback(() => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    setDb(resetDB());
  }, [canAdmin]);
  const clearAllData = useCallback(() => {
    if (!canAdmin) throw new Error('Bu işlem yalnızca yönetici tarafından yapılabilir.');
    setDb(clearDB());
  }, [canAdmin]);
  const exportData = useCallback(() => exportDB(db), [db]);

  const value = useMemo<AppContextValue>(
    () => ({
      db,
      currentUserId,
      currentRole,
      isAuthenticated,
      login,
      logout,
      setCurrentUserId,
      employee,
      customer,
      project,
      addJob,
      updateJob,
      deleteJob,
      setJobStatus,
      toggleSubtask,
      addSubtask,
      addComment,
      addFile,
      addProject,
      updateProject,
      deleteProject,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addDepartment,
      addMeeting,
      deleteMeeting,
      addTransaction,
      deleteTransaction,
      markNotificationRead,
      markAllNotificationsRead,
      logActivity,
      notify,
      updateSettings,
      resetDemo,
      clearAllData,
      exportData,
    }),
    [
      db, currentUserId, currentRole, isAuthenticated, login, logout, setCurrentUserId, employee, customer, project,
      addJob, updateJob, deleteJob, setJobStatus, toggleSubtask, addSubtask, addComment, addFile,
      addProject, updateProject, deleteProject, addEmployee, updateEmployee, deleteEmployee,
      addCustomer, updateCustomer, deleteCustomer, addDepartment, addMeeting, deleteMeeting,
      addTransaction, deleteTransaction, markNotificationRead, markAllNotificationsRead,
      logActivity, notify, updateSettings, resetDemo, clearAllData, exportData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp, AppProvider içinde kullanılmalıdır');
  return ctx;
}