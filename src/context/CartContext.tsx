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

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartState>(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addItem(store: CartStore, item: CartItem): AddItemResult {
    if (cart.store && cart.store.id_tienda !== store.id_tienda) {
      return {
        ok: false,
        message: 'Tu carrito tiene productos de otra tienda. Vacía el carrito antes de comprar en otra tienda.'
      };
    }

    setCart((currentCart) => {
      const existingItem = currentCart.items.find((cartItem) => {
        return (
          cartItem.id_producto === item.id_producto &&
          (cartItem.id_variante ?? null) === (item.id_variante ?? null)
        );
      });

      if (existingItem) {
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
              cantidad: cartItem.cantidad + item.cantidad
            };
          })
        };
      }

      return {
        store,
        items: [...currentCart.items, item]
      };
    });

    return {
      ok: true,
      message: 'Producto agregado al carrito.'
    };
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

        return {
          ...cartItem,
          cantidad: quantity
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