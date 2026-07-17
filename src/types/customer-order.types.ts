export type CustomerOrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'ENTREGADO';

export interface CustomerOrderInvoice {
  id_factura: string;
  numero_factura: string;
  cliente_nombre: string;
  cliente_correo?: string | null;
  subtotal: string | number;
  descuento: string | number;
  total: string | number;
  pdf_url?: string | null;
  correo_enviado: boolean;
  estado: string;
  fecha_emision: string;
}

export interface CustomerOrder {
  id_pedido: string;
  codigo_seguimiento?: string | null;
  id_tienda: string;
  nombre_tienda: string;
  slug_tienda: string;
  logo_url?: string | null;
  color_principal?: string | null;

  cliente_nombre: string;
  cliente_correo?: string | null;
  cliente_telefono: string;
  cliente_direccion?: string | null;
  observacion?: string | null;

  subtotal: string | number;
  descuento: string | number;
  total: string | number;
  estado: CustomerOrderStatus;
  whatsapp_enviado: boolean;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;

  cantidad_items: number;
  factura?: CustomerOrderInvoice | null;
}

export interface CustomerOrderDetailItem {
  id_pedido_detalle: string;
  id_producto: string;
  id_variante?: string | null;
  nombre_producto: string;
  talla?: string | null;
  color?: string | null;
  cantidad: number;
  precio_unitario: string | number;
  subtotal: string | number;
}

export interface CustomerOrderHistoryItem {
  estado_anterior?: string | null;
  estado_nuevo: string;
  observacion?: string | null;
  fecha_creacion: string;
}

export interface CustomerOrderDetail {
  pedido: CustomerOrder & {
    portada_url?: string | null;
    etiqueta_url?: string | null;
    whatsapp?: string | null;
    correo_contacto?: string | null;
    direccion_tienda?: string | null;
    mensaje_whatsapp?: string | null;
  };
  detalles: CustomerOrderDetailItem[];
  estados: CustomerOrderHistoryItem[];
  factura?: CustomerOrderInvoice | null;
}