// Veri saklama katmanı — UI'dan tamamen ayrıdır.
// Şu an localStorage kullanır; ileride buradaki fonksiyon imzaları korunarak
// gerçek bir REST/GraphQL backend'e bağlanabilir.
import type { DB } from '@/types/models';
import { buildDemoDB } from '@/data/demoData';

const KEY = 'sits_db_v1';

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && Array.isArray(parsed.jobs)) return parsed;
    }
  } catch {
    // bozuk veri durumunda yeniden kur
  }
  const fresh = buildDemoDB();
  saveDB(fresh);
  return fresh;
}

export function saveDB(db: DB): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // depolama dolu olabilir — sessizce geç
  }
}

export function resetDB(): DB {
  const fresh = buildDemoDB();
  saveDB(fresh);
  return fresh;
}

export function clearDB(): DB {
  const empty: DB = {
    company: { id: 'company_empty', name: '', slug: '', active: true, createdAt: new Date().toISOString() },
    userAccounts: [],
    departments: [],
    employees: [],
    customers: [],
    projects: [],
    jobs: [],
    meetings: [],
    transactions: [],
    notifications: [],
    activities: [],
    settings: {
      companyName: '',
      phone: '',
      email: '',
      address: '',
      currency: 'TRY',
      theme: 'light',
    },
  };
  saveDB(empty);
  return empty;
}

export function exportDB(db: DB): void {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yedek_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}