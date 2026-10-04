import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from '@/store/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { JobFormModal, type JobFormValues } from '@/components/jobs/JobFormModal';
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

function Shell() {
  const { db } = useApp();
  const [jobModal, setJobModal] = useState(false);
  const [defaults, setDefaults] = useState<Partial<JobFormValues> | undefined>();

  const openNewJob = (d?: Partial<JobFormValues>) => {
    setDefaults(d);
    setJobModal(true);
  };

  // Tüm veriler silindiyse ayarlar sayfası dışında anlamlı ekran kalmaz
  const empty = db.employees.length === 0;

  return (
    <AppLayout onNewJob={() => openNewJob()}>
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
        <Route path="/finans" element={<Finance />} />
        <Route path="/raporlar" element={<Reports />} />
        <Route path="/bildirimler" element={<Notifications />} />
        <Route path="/ayarlar" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <JobFormModal open={jobModal} onOpenChange={setJobModal} defaults={defaults} />
      {empty && (
        <p className="sr-only">Veri yok — Ayarlar sayfasından demo verileri yükleyebilirsiniz.</p>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
      <Toaster position="top-center" richColors closeButton />
    </AppProvider>
  );
}
