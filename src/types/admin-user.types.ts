export interface AdminUserRole{
    id_rol: string;
    codigo: 'ADMIN' | 'VENDEDOR' | 'CLIENTE' | string;
    nombre:string;
}
export interface AdminUser {
  id_usuario: string;
  nombres: string;
  correo: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
  fecha_creacion: string;
  fecha_actualizacion?: string | null;

  roles: AdminUserRole[];

  cantidad_tiendas: number;
  cantidad_pedidos: number;
  total_compras: string | number;
}