import { http } from './http';
import type { CustomerOrderDetail } from '../types/customer-order.types';

export interface TrackOrderPayload {
  code: string;
  phone: string;
}

export async function trackPublicOrder(payload: TrackOrderPayload) {
  const { data } = await http.post('/orders/track', payload);

  return data.order as CustomerOrderDetail;
}