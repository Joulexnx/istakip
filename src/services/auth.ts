import { apiRequest } from '@/services/api';

export interface LoginResponse {
  userId: string;
  token?: string;
}

export const isBackendAuthEnabled = Boolean(import.meta.env.VITE_API_URL);

export async function loginWithBackend(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function logoutFromBackend(): Promise<void> {
  if (!isBackendAuthEnabled) return;
  await apiRequest('/auth/logout', { method: 'POST' });
}
