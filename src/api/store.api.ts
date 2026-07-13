import { http } from './http';
import type { CreateStorePayload, Store } from '../types/store.types';
import type { AdminDashboardData, AdminStore } from '../types/admin-dashboard.types';

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

export interface UpdateSellerStorePayload {
  nombre: string;
  descripcion?: string | null;
  logo_url?: string | null;
  portada_url?: string | null;
  etiqueta_url?: string | null;
  color_principal: string;
  whatsapp: string;
  correo_contacto?: string | null;
  direccion?: string | null;
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

export async function getAdminDashboard(storeId?: string) {
  const params = storeId ? { storeId } : undefined;

  const { data } = await http.get('/stores/admin/dashboard', {
    params
  });

  return data.dashboard as AdminDashboardData;
}

export async function getAdminStores() {
  const { data } = await http.get('/stores/admin/all');

  return data.stores as AdminStore[];
}

export async function suspendAdminStore(
  storeId: string,
  observacion?: string
) {
  const { data } = await http.patch(`/stores/admin/${storeId}/suspend`, {
    observacion
  });

  return data.store as AdminStore;
}

export async function reactivateAdminStore(
  storeId: string,
  observacion?: string
) {
  const { data } = await http.patch(`/stores/admin/${storeId}/reactivate`, {
    observacion
  });

  return data.store as AdminStore;
}

// ACTUALIZAR TIENDA DEL VENDEDOR
export async function updateSellerStore(
  storeId: string,
  payload: UpdateSellerStorePayload
) {
  const { data } = await http.patch(`/stores/seller/${storeId}`, payload);

  return data.store;
}