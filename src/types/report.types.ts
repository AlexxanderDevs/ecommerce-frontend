export interface ReportSummary {
  fecha_inicio: string;
  fecha_fin: string;
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_confirmados: number;
  pedidos_entregados: number;
  pedidos_cancelados: number;
  ventas_confirmadas: string | number;
  ventas_perdidas_canceladas: string | number;
  ticket_promedio: string | number;
}

export interface SalesByDay {
  fecha: string;
  total_pedidos: number;
  pendientes: number;
  confirmados: number;
  entregados: number;
  cancelados: number;
  ventas: string | number;
}

export interface OrdersByStatus {
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ENTREGADO' | string;
  cantidad: number;
  total: string | number;
}

export interface TopProduct {
  id_producto: string;
  nombre_producto: string;
  cantidad_vendida: number;
  total_vendido: string | number;
}

export interface TopStore {
  id_tienda: string;
  nombre_tienda: string;
  slug: string;
  logo_url?: string | null;
  total_pedidos: number;
  total_vendido: string | number;
}

export interface LowStockReportItem {
  id_producto: string;
  id_variante?: string | null;
  producto: string;
  talla?: string | null;
  color?: string | null;
  stock: number;
  tipo: 'PRODUCTO' | 'VARIANTE';
}

export interface AdminReportData {
  resumen: ReportSummary;
  ventas_por_dia: SalesByDay[];
  pedidos_por_estado: OrdersByStatus[];
  productos_mas_vendidos: TopProduct[];
  tiendas_mas_vendidas: TopStore[];
}

export interface SellerReportData {
  resumen: ReportSummary;
  ventas_por_dia: SalesByDay[];
  pedidos_por_estado: OrdersByStatus[];
  productos_mas_vendidos: TopProduct[];
  stock_bajo: LowStockReportItem[];
}