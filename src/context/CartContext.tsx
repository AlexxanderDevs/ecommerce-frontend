import {
  createContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { CartItem, CartState, CartStore } from '../types/cart.types';

const CART_STORAGE_KEY = 'multitienda_cart';

interface AddItemResult {
  ok: boolean;
  message: string;
}

interface CartContextValue {
  cart: CartState;
  itemsCount: number;
  total: number;
  addItem: (store: CartStore, item: CartItem) => AddItemResult;
  removeItem: (idProducto: string, idVariante?: string | null) => void;
  updateQuantity: (
    idProducto: string,
    idVariante: string | null | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: React.ReactNode;
}

function loadInitialCart(): CartState {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return {
      store: null,
      items: []
    };
  }

  try {
    return JSON.parse(storedCart) as CartState;
  } catch {
    return {
      store: null,
      items: []
    };
  }
}

function clampQuantity(quantity: number, stock?: number) {
  if (quantity <= 0) return 0;

  if (typeof stock === 'number' && stock >= 0) {
    return Math.min(quantity, stock);
  }

  return quantity;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartState>(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addItem(store: CartStore, item: CartItem): AddItemResult {
    if (cart.store && cart.store.id_tienda !== store.id_tienda) {
      return {
        ok: false,
        message:
          'Tu carrito tiene productos de otra tienda. Vacía el carrito antes de comprar en otra tienda.'
      };
    }

    const stockDisponible = item.stock_disponible;

    if (typeof stockDisponible === 'number' && stockDisponible <= 0) {
      return {
        ok: false,
        message: 'Este producto no tiene stock disponible.'
      };
    }

    let result: AddItemResult = {
      ok: true,
      message: 'Producto agregado al carrito.'
    };

    setCart((currentCart) => {
      const existingItem = currentCart.items.find((cartItem) => {
        return (
          cartItem.id_producto === item.id_producto &&
          (cartItem.id_variante ?? null) === (item.id_variante ?? null)
        );
      });

      if (existingItem) {
        const newQuantity = existingItem.cantidad + item.cantidad;
        const limitedQuantity = clampQuantity(
          newQuantity,
          existingItem.stock_disponible ?? item.stock_disponible
        );

        if (limitedQuantity < newQuantity) {
          result = {
            ok: false,
            message: 'No puedes agregar más unidades que el stock disponible.'
          };

          return currentCart;
        }

        return {
          store,
          items: currentCart.items.map((cartItem) => {
            const isSameItem =
              cartItem.id_producto === item.id_producto &&
              (cartItem.id_variante ?? null) === (item.id_variante ?? null);

            if (!isSameItem) {
              return cartItem;
            }

            return {
              ...cartItem,
              cantidad: limitedQuantity,
              stock_disponible:
                item.stock_disponible ?? cartItem.stock_disponible
            };
          })
        };
      }

      const limitedQuantity = clampQuantity(item.cantidad, item.stock_disponible);

      if (limitedQuantity <= 0) {
        result = {
          ok: false,
          message: 'Este producto no tiene stock disponible.'
        };

        return currentCart;
      }

      if (limitedQuantity < item.cantidad) {
        result = {
          ok: false,
          message: 'No puedes agregar más unidades que el stock disponible.'
        };

        return currentCart;
      }

      return {
        store,
        items: [
          ...currentCart.items,
          {
            ...item,
            cantidad: limitedQuantity
          }
        ]
      };
    });

    return result;
  }

  function removeItem(idProducto: string, idVariante?: string | null) {
    setCart((currentCart) => {
      const newItems = currentCart.items.filter((cartItem) => {
        return !(
          cartItem.id_producto === idProducto &&
          (cartItem.id_variante ?? null) === (idVariante ?? null)
        );
      });

      return {
        store: newItems.length > 0 ? currentCart.store : null,
        items: newItems
      };
    });
  }

  function updateQuantity(
    idProducto: string,
    idVariante: string | null | undefined,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeItem(idProducto, idVariante);
      return;
    }

    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.map((cartItem) => {
        const isSameItem =
          cartItem.id_producto === idProducto &&
          (cartItem.id_variante ?? null) === (idVariante ?? null);

        if (!isSameItem) {
          return cartItem;
        }

        const limitedQuantity = clampQuantity(
          quantity,
          cartItem.stock_disponible
        );

        return {
          ...cartItem,
          cantidad: limitedQuantity
        };
      })
    }));
  }

  function clearCart() {
    setCart({
      store: null,
      items: []
    });
  }

  const itemsCount = cart.items.reduce(
    (totalItems, item) => totalItems + item.cantidad,
    0
  );

  const total = cart.items.reduce(
    (totalPrice, item) => totalPrice + item.precio_unitario * item.cantidad,
    0
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemsCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }),
    [cart, itemsCount, total]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}