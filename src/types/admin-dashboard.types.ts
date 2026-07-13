export interface AdminDashboardSummary {
    tiendas_pendientes: number;
    tiendas_activas: number;
    tiendas_rechazadas: number;
    tiendas_suspendidas: number;
    vendedores: number;
    clientes: number;
    productos_activos: number;
    pedidos_hoy: number;
    ventas_hoy: string | number;
    ventas_totales: string | number;
}

export interface AdminDashboardStore {
    id_tienda: string;
    nombre: string;
    nombre_comercial?: string | null;
    slug: string;
    logo_url?: string | null;
    estado: string;
    fecha_creacion: string;
}

export interface AdminDashboardOrder {
    id_pedido: string;
    id_tienda: string;
    nombre_tienda: string;
    cliente_nombre: string;
    cliente_telefono: string;
    total: string | number;
    estado: string;
    fecha_creacion: string;
}

export interface AdminDashboardData {
    resumen: AdminDashboardSummary;
    tiendas_disponibles: AdminDashboardStoreOption[];
    ultimas_tiendas: AdminDashboardStore[];
    ultimos_pedidos: AdminDashboardOrder[];
}

export interface AdminDashboardStoreOption {
    id_tienda: string;
    nombre: string;
    nombre_comercial?: string | null;
    slug: string;
    logo_url?: string | null;
    estado: string;
}