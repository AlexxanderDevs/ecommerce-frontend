import { http } from './http';
import type { CreateStorePayload, Store } from '../types/store.types';

interface CreateStoreResponse {
  ok: boolean;
  message: string;
  store: Store;
}

interface MyStoresResponse {
  ok: boolean;
  stores: Store[];
}

interface PublicStoresResponse {
  ok: boolean;
  stores: Store[];
}

interface PendingStoresResponse {
  ok: boolean;
  stores: Store[];
}

interface StoreActionResponse {
  ok: boolean;
  message: string;
  store: Store;
}

export interface AdminNotification {
  id_notificacion: string;
  id_tienda: string | null;
  nombre_tienda: string | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
}

interface AdminNotificationsResponse {
  ok: boolean;
  notifications: AdminNotification[];
}

export async function createStore(payload: CreateStorePayload) {
  const { data } = await http.post<CreateStoreResponse>('/stores', payload);
  return data;
}

export async function getMyStores() {
  const { data } = await http.get<MyStoresResponse>('/stores/my');
  return data.stores;
}

export async function getPublicStores() {
  const { data } = await http.get<PublicStoresResponse>('/stores/public');
  return data.stores;
}

export async function getPendingStores() {
  const { data } = await http.get<PendingStoresResponse>('/stores/admin/pending');
  return data.stores;
}

export async function approveStore(idTienda: string, observacion?: string) {
  const { data } = await http.post<StoreActionResponse>(
    `/stores/admin/${idTienda}/approve`,
    {
      observacion
    }
  );

  return data;
}

export async function rejectStore(idTienda: string, observacion?: string) {
  const { data } = await http.post<StoreActionResponse>(
    `/stores/admin/${idTienda}/reject`,
    {
      observacion
    }
  );

  return data;
}

export async function getAdminNotifications() {
  const { data } = await http.get<AdminNotificationsResponse>(
    '/stores/admin/notifications'
  );

  return data.notifications;
}

export async function markNotificationAsRead(idNotificacion: string) {
  const { data } = await http.patch(
    `/stores/admin/notifications/${idNotificacion}/read`
  );

  return data;
}