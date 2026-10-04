import { useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import type { Role } from '@/types/models';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from '@/store/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { JobFormModal, type JobFormValues } from '@/components/jobs/JobFormModal';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Kanban from '@/pages/Kanban';
import Projects, { ProjectDetail } from '@/pages/Projects';
import Employees, { EmployeeDetail } from '@/pages/Employees';
import Customers, { CustomerDetail } from '@/pages/Customers';
import CalendarPage from '@/pages/CalendarPage';
import Finance from '@/pages/Finance';
import Reports from '@/pages/Reports';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';

function RoleRoute({ roles, children }: { roles: readonly Role[]; children: ReactNode }) {
  const { currentRole } = useApp();
  return roles.includes(currentRole) ? <>{children}</> : <Navigate to="/" replace />;
}

function ProtectedRoutes() {
  const { isAuthenticated, authReady } = useApp();
  const location = useLocation();

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Oturum doğrulanıyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/giris" replace state={{ from: location.pathname }} />;
  }

  return <Shell />;
}

function Shell() {
  const { db } = useApp();
  const [jobModal, setJobModal] = useState(false);
  const [defaults, setDefaults] = useState<Partial<JobFormValues> | undefined>();

  const openNewJob = (d?: Partial<JobFormValues>) => {
    setDefaults(d);
    setJobModal(true);
  };

  const empty = db.employees.length === 0;

  return (
    <AppLayout onNewJob={openNewJob}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/isler" element={<Jobs onNewJob={openNewJob} />} />
        <Route path="/isler/:id" element={<JobDetail />} />
        <Route path="/pano" element={<Kanban />} />
        <Route path="/projeler" element={<Projects />} />
        <Route path="/projeler/:id" element={<ProjectDetail />} />
        <Route path="/calisanlar" element={<Employees />} />
        <Route path="/calisanlar/:id" element={<EmployeeDetail />} />
        <Route path="/musteriler" element={<Customers />} />
        <Route path="/musteriler/:id" element={<CustomerDetail />} />
        <Route path="/takvim" element={<CalendarPage />} />
        <Route path="/finans" element={<RoleRoute roles={['yonetici', 'yardimci']}><Finance /></RoleRoute>} />
        <Route path="/raporlar" element={<RoleRoute roles={['yonetici', 'yardimci']}><Reports /></RoleRoute>} />
        <Route path="/bildirimler" element={<Notifications />} />
        <Route path="/ayarlar" element={<RoleRoute roles={['yonetici']}><Settings /></RoleRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <JobFormModal open={jobModal} onOpenChange={setJobModal} defaults={defaults} />
      {empty && (
        <p className="sr-only">Veri yok — Ayarlar sayfasından şirket verilerini yönetebilirsiniz.</p>
      )}
    </AppLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated, authReady } = useApp();

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Oturum doğrulanıyor...</div>;
  }

  return (
    <Routes>
      <Route path="/giris" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <Toaster position="top-center" richColors closeButton />
    </AppProvider>
  );
}
