export interface SellerOrder {
  id_pedido: string;
  id_tienda: string;
  cliente_nombre: string;
  cliente_correo?: string | null;
  cliente_telefono: string;
  cliente_direccion?: string | null;
  subtotal: string | number;
  descuento: string | number;
  total: string | number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ENTREGADO';
  whatsapp_enviado: boolean;
  cantidad_items: number;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface OrderDetailItem {
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

export interface OrderHistoryItem {
  estado_anterior?: string | null;
  estado_nuevo: string;
  observacion?: string | null;
  fecha_creacion: string;
}

export interface OrderInvoice {
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

export interface SellerOrderDetail {
  pedido: {
    id_pedido: string;
    id_tienda: string;
    nombre_tienda: string;
    logo_url?: string | null;
    etiqueta_url?: string | null;
    whatsapp: string;
    cliente_nombre: string;
    cliente_correo?: string | null;
    cliente_telefono: string;
    cliente_direccion?: string | null;
    observacion?: string | null;
    subtotal: string | number;
    descuento: string | number;
    total: string | number;
    estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ENTREGADO';
    mensaje_whatsapp?: string | null;
    whatsapp_enviado: boolean;
    fecha_creacion: string;
    fecha_actualizacion?: string;
  };
  detalles: OrderDetailItem[];
  estados: OrderHistoryItem[];
  factura?: OrderInvoice | null;
}