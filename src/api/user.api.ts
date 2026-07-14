import { http } from './http';
import type { AdminUser } from '../types/admin-user.types';

export async function getAdminUsers() {
  const { data } = await http.get('/users/admin');

  return data.users as AdminUser[];
}

export async function deactivateAdminUser(
  userId: string,
  observacion?: string
) {
  const { data } = await http.patch(`/users/admin/${userId}/deactivate`, {
    observacion
  });

  return data.user as AdminUser;
}

export async function activateAdminUser(
  userId: string,
  observacion?: string
) {
  const { data } = await http.patch(`/users/admin/${userId}/activate`, {
    observacion
  });

  return data.user as AdminUser;
}