import type { SellerOrder } from './order.types';

export interface SellerDashboardSummary {
  pedidos_pendientes: number;
  pedidos_confirmados: number;
  pedidos_entregados: number;
  pedidos_cancelados: number;
  pedidos_hoy: number;
  ventas_hoy: string | number;
  ventas_totales: string | number;
  productos_activos: number;
}

export interface LowStockItem {
  id_producto: string;
  id_variante?: string | null;
  producto: string;
  talla?: string | null;
  color?: string | null;
  stock: number;
  tipo: 'PRODUCTO' | 'VARIANTE';
}

export interface SellerDashboardData {
  resumen: SellerDashboardSummary;
  bajo_stock: LowStockItem[];
  ultimos_pedidos: Pick<
    SellerOrder,
    | 'id_pedido'
    | 'cliente_nombre'
    | 'cliente_telefono'
    | 'total'
    | 'estado'
    | 'fecha_creacion'
  >[];
}