export interface Store {
  id_tienda: string;
  id_usuario_duenio?: string;
  nombre: string;
  nombre_comercial?: string;
  slug: string;
  descripcion?: string | null;
  logo_url?: string | null;
  portada_url?: string | null;
  etiqueta_url?: string | null;
  color_principal: string;
  whatsapp: string;
  correo_contacto?: string | null;
  direccion?: string | null;
  estado?: 'PENDIENTE_REVISION' | 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA' | 'RECHAZADA' | 'ELIMINADA';
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface CreateStorePayload {
  nombre: string;
  descripcion?: string;
  logo_url?: string;
  portada_url?: string;
  etiqueta_url?: string;
  color_principal: string;
  whatsapp: string;
  correo_contacto?: string;
  direccion?: string;
}