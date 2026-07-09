export interface Category {
  id_categoria: string;
  id_tienda: string;
  id_categoria_padre?: string | null;
  categoria_padre?: string | null;
  nombre: string;
  descripcion?: string | null;
  estado: string;
}

export interface Product {
  id_producto: string;
  id_tienda: string;
  id_categoria?: string | null;
  categoria?: string | null;
  codigo_producto?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: string | number;
  stock_general: number;
  requiere_variantes: boolean;
  stock_variantes?: number;
  stock_disponible?: number;
  destacado: boolean;
  estado: string;
  imagen_principal?: string | null;
  fecha_creacion: string;
}

export interface CreateCategoryPayload {
  id_tienda: string;
  id_categoria_padre?: string;
  nombre: string;
  descripcion?: string;
}

export interface CreateProductPayload {
  id_tienda: string;
  id_categoria?: string;
  codigo_producto?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock_general: number;
  requiere_variantes: boolean;
  destacado: boolean;
  imagen_principal_url?: string;
}

export interface CreateVariantPayload {
  sku?: string;
  talla?: string;
  color?: string;
  descripcion_variante?: string;
  stock: number;
  precio_adicional: number;
}

export interface ProductVariant {
  id_variante: string;
  sku?: string | null;
  talla?: string | null;
  color?: string | null;
  descripcion_variante?: string | null;
  stock: number;
  precio_adicional: string | number;
  estado: string;
}

export interface ProductImage {
  id_imagen: string;
  url_imagen: string;
  es_principal: boolean;
  orden: number;
}

export interface PublicProductDetail {
  producto: Product & {
    nombre_tienda: string;
    slug_tienda: string;
    logo_url?: string | null;
    portada_url?: string | null;
    etiqueta_url?: string | null;
    color_principal?: string;
    whatsapp?: string;
  };
  imagenes: ProductImage[];
  variantes: ProductVariant[];
}