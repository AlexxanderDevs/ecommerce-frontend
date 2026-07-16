import { http } from './http';
import type {
  CustomerOrder,
  CustomerOrderDetail
} from '../types/customer-order.types';

export async function getCustomerOrders() {
  const { data } = await http.get('/orders/customer');

  return data.orders as CustomerOrder[];
}

export async function getCustomerOrderDetail(orderId: string) {
  const { data } = await http.get(`/orders/customer/${orderId}`);

  return data.order as CustomerOrderDetail;
}