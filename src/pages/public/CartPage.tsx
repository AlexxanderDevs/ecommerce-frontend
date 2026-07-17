import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { createOrder, markWhatsAppSent } from '../../api/order.api';
import { assetUrl } from '../../utils/assets';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Copy, CheckCircle2 } from 'lucide-react';

interface CreatedOrderInfo {
  id_pedido: string;
  codigo_seguimiento: string;
  cliente_telefono: string;
  nombre_tienda: string;
  total: number;
  whatsapp_url?: string;
}

export function CartPage() {
  const { user } = useAuth();
  function userHasRole(role: string) {
    const roles = user?.roles ?? [];

    return roles.some((item: any) => {
      if (typeof item === 'string') {
        return item === role;
      }

      return item.codigo === role;
    });
  }
  const isAdmin = userHasRole('ADMIN');
  const isSeller = userHasRole('VENDEDOR');
  const isCustomer = userHasRole('CLIENTE');

  const cannotBuyWithCurrentAccount =
    user && (isAdmin || isSeller) && !isCustomer;
  const {
    cart,
    total,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteCorreo, setClienteCorreo] = useState(user?.correo ?? '');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [observacion, setObservacion] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const storeColor = cart.store?.color_principal || '#111827';
  const [createdOrderInfo, setCreatedOrderInfo] =
    useState<CreatedOrderInfo | null>(null);

  async function copyOrderCode() {
    if (!createdOrderInfo) return;

    try {
      await navigator.clipboard.writeText(createdOrderInfo.codigo_seguimiento);
      toast.success('Código de seguimiento copiado.');
    } catch {
      toast.error('No se pudo copiar el código de seguimiento.');
    }
  }

  function goToTrackOrder() {
    window.location.href = `/track-order`;
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault();
    if (cannotBuyWithCurrentAccount) {
      const message =
        'Esta cuenta no puede realizar compras. Usa una cuenta de cliente o compra como invitado.';

      setError(message);
      toast.error(message);
      return;
    }

    if (!cart.store) {
      const message = 'No hay tienda asociada al carrito.';
      setError(message);
      toast.error(message);
      return;
    }

    if (cart.items.length === 0) {
      const message = 'Tu carrito está vacío.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const order = await createOrder({
        id_tienda: cart.store.id_tienda,
        cliente_nombre: clienteNombre,
        cliente_correo: clienteCorreo || undefined,
        cliente_telefono: clienteTelefono,
        cliente_direccion: clienteDireccion || undefined,
        observacion: observacion || undefined,
        items: cart.items.map((item) => ({
          id_producto: item.id_producto,
          id_variante: item.id_variante ?? null,
          cantidad: item.cantidad
        }))
      });
      const orderId = order?.pedido?.id_pedido;
      const trackingCode =
        order?.pedido?.codigo_seguimiento || order?.pedido?.id_pedido;
      const whatsappUrl = order?.whatsapp?.url;

      if (orderId) {
        setCreatedOrderInfo({
          id_pedido: orderId,
          codigo_seguimiento: trackingCode,
          cliente_telefono: clienteTelefono,
          nombre_tienda: cart.store.nombre_tienda,
          total,
          whatsapp_url: whatsappUrl
        });
      }
      if (whatsappUrl) {
        toast.success('Pedido creado correctamente. Se abrirá WhatsApp para enviarlo al vendedor.');
        window.open(whatsappUrl, '_blank');

        if (orderId) {
          await markWhatsAppSent(orderId);
        }
      }

      clearCart();
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo crear el pedido. Revisa los datos y el stock.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (cart.items.length === 0) {
    if (createdOrderInfo) {
      return (
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 text-green-700">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Pedido creado correctamente
            </h1>

            <p className="mt-3 text-slate-600">
              Tu pedido fue registrado para la tienda{' '}
              <strong>{createdOrderInfo.nombre_tienda}</strong>.
            </p>

            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-medium text-slate-500">
                Código de seguimiento
              </p>

              <div className="mt-2 flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <code className="break-all text-sm font-semibold text-slate-900">
                  {createdOrderInfo.codigo_seguimiento}
                </code>

                <button
                  type="button"
                  onClick={copyOrderCode}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <strong>Teléfono usado:</strong>{' '}
                  {createdOrderInfo.cliente_telefono}
                </p>

                <p>
                  <strong>Total:</strong> ${createdOrderInfo.total.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                Guarda este código de seguimiento. Lo necesitarás junto con tu teléfono para
                consultar el estado del pedido.
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goToTrackOrder}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
              >
                Consultar mi pedido
              </button>

              {createdOrderInfo.whatsapp_url && (
                <a
                  href={createdOrderInfo.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-green-300 px-5 py-3 font-medium text-green-700 hover:bg-green-50"
                >
                  Abrir WhatsApp nuevamente
                </a>
              )}

              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-slate-400" />

        <h1 className="mt-4 text-3xl font-bold">Tu carrito está vacío</h1>

        <p className="mt-2 text-slate-600">
          Agrega productos de una tienda para poder hacer tu pedido.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
        >
          Volver al inicio
        </a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: storeColor }}
        >
          Carrito de compras
        </h1>        <p className="mt-2 text-slate-600">
          Pedido para la tienda: <strong style={{ color: storeColor }}>
            {cart.store?.nombre_tienda}
          </strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <article
              key={`${item.id_producto}-${item.id_variante ?? 'simple'}`}
              className="flex gap-4 rounded-3xl border bg-white p-4 shadow-sm"
              style={{ borderColor: '#e2e8f0' }}
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {item.imagen ? (
                  <img
                    src={assetUrl(item.imagen)}
                    alt={item.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-8 w-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2
                      className="font-bold"
                      style={{ color: storeColor }}
                    >
                      {item.nombre}
                    </h2>
                    {(item.talla || item.color) && (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.talla ? `Talla: ${item.talla}` : ''}
                        {item.talla && item.color ? ' | ' : ''}
                        {item.color ? `Color: ${item.color}` : ''}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-slate-600">
                      ${item.precio_unitario.toFixed(2)} c/u
                    </p>
                    {typeof item.stock_disponible === 'number' && (
                      <p
                        className={`mt-1 text-xs font-medium ${item.stock_disponible <= 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                      >
                        Stock disponible: {item.stock_disponible}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.id_producto, item.id_variante)}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id_producto,
                          item.id_variante,
                          item.cantidad - 1
                        )
                      }
                      className="p-2 hover:bg-slate-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="px-4 text-sm font-medium">
                      {item.cantidad}
                    </span>

                    <button
                      type="button"
                      disabled={
                        typeof item.stock_disponible === 'number' &&
                        item.cantidad >= item.stock_disponible
                      }
                      onClick={() =>
                        updateQuantity(
                          item.id_producto,
                          item.id_variante,
                          item.cantidad + 1
                        )
                      }
                      className="p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Subtotal</p>
                    <p className="font-bold">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        {cannotBuyWithCurrentAccount && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            Esta cuenta pertenece a un administrador o vendedor. Para comprar, usa una cuenta de cliente o realiza el pedido como invitado.
          </div>
        )}
        <form
          onSubmit={handleCreateOrder}
          className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold">Datos del pedido</h2>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre completo</label>
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Correo</label>
              <input
                value={clienteCorreo}
                onChange={(e) => setClienteCorreo(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <input
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="0999999999"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Dirección</label>
              <input
                value={clienteDireccion}
                onChange={(e) => setClienteDireccion(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Quevedo, Ecuador"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Observación</label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Ejemplo: entregar en la tarde"
              />
            </div>
          </div>

          <div className="my-6 border-t border-slate-200 pt-6">
            <div
              className="flex justify-between text-lg font-bold"
              style={{ color: storeColor }}
            >
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={loading || Boolean(cannotBuyWithCurrentAccount)}
            className="w-full rounded-xl px-5 py-4 font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: storeColor }}
          >
            {loading ? 'Creando pedido...' : 'Hacer pedido por WhatsApp'}

          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            No se realizará pago en la aplicación. El pedido se enviará al WhatsApp del vendedor.
          </p>
        </form>
      </div>
    </section>
  );
}