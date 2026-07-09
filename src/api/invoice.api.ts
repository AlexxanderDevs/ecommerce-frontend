import { http } from './http';

export async function getInvoiceByOrder(orderId: string) {
  const { data } = await http.get(`/invoices/seller/orders/${orderId}`);
  return data.invoice;
}

export async function sendInvoiceByEmail(orderId: string) {
  const { data } = await http.post(
    `/invoices/seller/orders/${orderId}/send-email`
  );

  return data.result;
}