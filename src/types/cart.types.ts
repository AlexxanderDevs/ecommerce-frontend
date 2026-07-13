export interface CartStore {
  id_tienda: string;
  nombre_tienda: string;
  slug_tienda: string;
  whatsapp?: string | null;
  color_principal?: string | null;
}

export interface CartItem {
  id_producto: string;
  id_variante?: string | null;

  nombre: string;
  imagen?: string | null;

  talla?: string | null;
  color?: string | null;

  precio_unitario: number;
  cantidad: number;

  requiere_variantes: boolean;
  stock_disponible?: number;
}

export interface CartState {
  store: CartStore | null;
  items: CartItem[];
}