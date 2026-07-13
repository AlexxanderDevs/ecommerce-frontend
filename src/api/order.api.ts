import { http } from './http';
import type { SellerOrder, SellerOrderDetail } from '../types/order.types';
import type { SellerDashboardData } from '../types/dashboard.types';

export interface CreateOrderPayload {
  id_tienda: string;
  cliente_nombre: string;
  cliente_correo?: string;
  cliente_telefono: string;
  cliente_direccion?: string;
  observacion?: string;
  items: Array<{
    id_producto: string;
    id_variante?: string | null;
    cantidad: number;
  }>;
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await http.post('/orders', payload);
  return data.order;
}

export async function markWhatsAppSent(orderId: string) {
  const { data } = await http.patch(`/orders/${orderId}/whatsapp-sent`);
  return data;
}

export async function getSellerOrdersByStore(storeId: string) {
  const { data } = await http.get(`/orders/seller/stores/${storeId}`);
  return data.orders as SellerOrder[];
}

export async function getSellerOrderDetail(orderId: string) {
  const { data } = await http.get(`/orders/seller/${orderId}`);
  return data.order as SellerOrderDetail;
}

export async function confirmSellerOrder(orderId: string, observacion?: string) {
  const { data } = await http.post(`/orders/seller/${orderId}/confirm`, {
    observacion
  });

  return data.order as SellerOrderDetail;
}

export async function cancelSellerOrder(orderId: string, observacion?: string) {
  const { data } = await http.post(`/orders/seller/${orderId}/cancel`, {
    observacion
  });

  return data.order as SellerOrderDetail;
}

export async function deliverSellerOrder(orderId: string, observacion?: string) {
  const { data } = await http.post(`/orders/seller/${orderId}/deliver`, {
    observacion
  });

  return data.order as SellerOrderDetail;
}

export async function getSellerDashboardByStore(storeId: string) {
  const { data } = await http.get(
    `/orders/seller/stores/${storeId}/dashboard`
  );

  return data.dashboard as SellerDashboardData;
}