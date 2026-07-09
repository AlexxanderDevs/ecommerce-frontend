import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Loader2,
  PackageCheck,
  RefreshCcw,
  Send,
  ShoppingBag,
  XCircle
} from 'lucide-react';
import { getMyStores } from '../../api/store.api';
import {
  cancelSellerOrder,
  confirmSellerOrder,
  deliverSellerOrder,
  getSellerOrderDetail,
  getSellerOrdersByStore
} from '../../api/order.api';
import { sendInvoiceByEmail } from '../../api/invoice.api';
import type { Store as StoreType } from '../../types/store.types';
import type { SellerOrder, SellerOrderDetail } from '../../types/order.types';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

const statusStyles: Record<SellerOrder['estado'], string> = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
  ENTREGADO: 'bg-green-50 text-green-700 border-green-200'
};

export function SellerOrdersPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrderDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadOrders(selectedStoreId);
    }
  }, [selectedStoreId]);

  async function loadStores() {
    try {
      setLoading(true);
      setError('');

      const data = await getMyStores();
      const activeStores = data.filter((store) => store.estado === 'ACTIVA');

      setStores(activeStores);

      if (activeStores.length > 0) {
        setSelectedStoreId(activeStores[0].id_tienda);
      }
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudieron cargar tus tiendas.')
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders(storeId: string) {
    try {
      setLoadingOrders(true);
      setError('');
      setSelectedOrder(null);

      const data = await getSellerOrdersByStore(storeId);
      setOrders(data);
    } catch (error){
      const message = getErrorMessage(error,'No se pudieron cargar los pedidos.' );
      toast.error(message);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function handleViewDetail(orderId: string) {
    try {
      setActionLoading(orderId);
      setError('');
      setMessage('');

      const detail = await getSellerOrderDetail(orderId);
      setSelectedOrder(detail);
      setObservacion('');
    } catch (error){
      const message = getErrorMessage(error,'No se pudo cargar el detalle del pedido.' );
      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  async function handleConfirm(orderId: string) {
    try {
      setActionLoading(orderId);
      setError('');
      setMessage('');

      const detail = await confirmSellerOrder(
        orderId,
        observacion || 'Pedido confirmado por el vendedor.'
      );

      setSelectedOrder(detail);
      setMessage('Pedido confirmado correctamente. Se descontó el stock y se generó la factura.');
      toast.success('Pedido confirmado correctamente.');
      setObservacion('');

      if (selectedStoreId) {
        await loadOrders(selectedStoreId);
      }
    } catch (error) {
      const message = getErrorMessage (error, 'No se pudo confirmar el pedido. Revisa el stock disponible.');
      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  async function handleCancel(orderId: string) {
    try {
      setActionLoading(orderId);
      setError('');
      setMessage('');

      const detail = await cancelSellerOrder(
        orderId,
        observacion || 'Pedido cancelado por el vendedor.'
      );

      setSelectedOrder(detail);
      setMessage('Pedido cancelado correctamente.');
      toast.success('Pedido cancelado correctamente.');
      setObservacion('');

      if (selectedStoreId) {
        await loadOrders(selectedStoreId);
      }
    } catch (error){
      const message = getErrorMessage(error,'No se pudo cancelar el pedido.' );
      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  async function handleDeliver(orderId: string) {
    try {
      setActionLoading(orderId);
      setError('');
      setMessage('');

      const detail = await deliverSellerOrder(
        orderId,
        observacion || 'Pedido entregado al cliente.'
      );

      setSelectedOrder(detail);
      setMessage('Pedido marcado como entregado.');
      toast.success('Pedido marcado como entregado.');
      setObservacion('');

      if (selectedStoreId) {
        await loadOrders(selectedStoreId);
      }
    } catch (error){
      const message = getErrorMessage(error,'No se pudo marcar el pedido como entregado.' );
      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  async function handleSendInvoice(orderId: string) {
    try {
      setActionLoading(orderId);
      setError('');
      setMessage('');

      await sendInvoiceByEmail(orderId);

      const detail = await getSellerOrderDetail(orderId);
      setSelectedOrder(detail);

      setMessage('Factura generada y enviada correctamente al correo del cliente.');
      toast.success('Factura enviada correctamente.');
    } catch (error){
      const message = getErrorMessage(error,'No se pudo enviar la factura. Revisa que el pedido tenga correo y que SMTP esté configurado.');
      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos recibidos</h1>
          <p className="mt-2 text-slate-600">
            Revisa pedidos enviados por WhatsApp, confirma ventas, descuenta stock y envía facturas.
          </p>
        </div>

        <button
          onClick={() => selectedStoreId && loadOrders(selectedStoreId)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          Cargando tiendas...
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No tienes tiendas activas</h2>
          <p className="mt-2 text-slate-600">
            Primero necesitas una tienda aprobada para recibir pedidos.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-sm font-medium">Seleccionar tienda</label>
            <select
              value={selectedStoreId}
              onChange={(event) => setSelectedStoreId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            >
              {stores.map((store) => (
                <option key={store.id_tienda} value={store.id_tienda}>
                  {store.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
            <div>
              <h2 className="mb-4 text-xl font-bold">Lista de pedidos</h2>

              {loadingOrders ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                  Cargando pedidos...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
                  <h2 className="mt-4 text-xl font-bold">No hay pedidos todavía</h2>
                  <p className="mt-2 text-slate-600">
                    Cuando un cliente haga un pedido, aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id_pedido}
                      order={order}
                      loading={actionLoading === order.id_pedido}
                      onView={() => handleViewDetail(order.id_pedido)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold">Detalle del pedido</h2>

              {!selectedOrder ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                  Selecciona un pedido para ver su detalle.
                </div>
              ) : (
                <OrderDetailPanel
                  order={selectedOrder}
                  observacion={observacion}
                  onChangeObservacion={setObservacion}
                  loading={actionLoading === selectedOrder.pedido.id_pedido}
                  onConfirm={() => handleConfirm(selectedOrder.pedido.id_pedido)}
                  onCancel={() => handleCancel(selectedOrder.pedido.id_pedido)}
                  onDeliver={() => handleDeliver(selectedOrder.pedido.id_pedido)}
                  onSendInvoice={() => handleSendInvoice(selectedOrder.pedido.id_pedido)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

interface OrderCardProps {
  order: SellerOrder;
  loading: boolean;
  onView: () => void;
}

function OrderCard({ order, loading, onView }: OrderCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold">{order.cliente_nombre}</h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                statusStyles[order.estado]
              }`}
            >
              {order.estado}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.fecha_creacion).toLocaleString()}
          </p>

          <div className="mt-3 grid gap-1 text-sm text-slate-600 md:grid-cols-3">
            <p>
              <strong>Tel:</strong> {order.cliente_telefono}
            </p>
            <p>
              <strong>Items:</strong> {order.cantidad_items}
            </p>
            <p>
              <strong>Total:</strong> ${Number(order.total).toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={onView}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Ver detalle
        </button>
      </div>
    </article>
  );
}

interface OrderDetailPanelProps {
  order: SellerOrderDetail;
  observacion: string;
  loading: boolean;
  onChangeObservacion: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDeliver: () => void;
  onSendInvoice: () => void;
}

function OrderDetailPanel({
  order,
  observacion,
  loading,
  onChangeObservacion,
  onConfirm,
  onCancel,
  onDeliver,
  onSendInvoice
}: OrderDetailPanelProps) {
  const pedido = order.pedido;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{pedido.cliente_nombre}</h3>
          <p className="text-sm text-slate-500">
            {new Date(pedido.fecha_creacion).toLocaleString()}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            statusStyles[pedido.estado]
          }`}
        >
          {pedido.estado}
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-700">
        <p>
          <strong>Teléfono:</strong> {pedido.cliente_telefono}
        </p>

        <p>
          <strong>Correo:</strong> {pedido.cliente_correo || 'No registrado'}
        </p>

        <p>
          <strong>Dirección:</strong> {pedido.cliente_direccion || 'No registrada'}
        </p>

        {pedido.observacion && (
          <p>
            <strong>Observación:</strong> {pedido.observacion}
          </p>
        )}
      </div>

      <div className="my-6 border-t border-slate-200" />

      <h4 className="font-bold">Productos</h4>

      <div className="mt-3 space-y-3">
        {order.detalles.map((item) => (
          <div
            key={item.id_pedido_detalle}
            className="rounded-2xl border border-slate-200 p-4 text-sm"
          >
            <p className="font-semibold">{item.nombre_producto}</p>

            {(item.talla || item.color) && (
              <p className="mt-1 text-slate-500">
                {item.talla ? `Talla: ${item.talla}` : ''}
                {item.talla && item.color ? ' | ' : ''}
                {item.color ? `Color: ${item.color}` : ''}
              </p>
            )}

            <div className="mt-2 flex justify-between text-slate-700">
              <span>
                {item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}
              </span>
              <strong>${Number(item.subtotal).toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="my-6 border-t border-slate-200" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <strong>${Number(pedido.subtotal).toFixed(2)}</strong>
        </div>

        <div className="flex justify-between">
          <span>Descuento</span>
          <strong>${Number(pedido.descuento).toFixed(2)}</strong>
        </div>

        <div className="flex justify-between text-lg">
          <span>Total</span>
          <strong>${Number(pedido.total).toFixed(2)}</strong>
        </div>
      </div>

      {order.factura && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <p>
            <strong>Factura:</strong> {order.factura.numero_factura}
          </p>

          <p>
            <strong>Correo enviado:</strong>{' '}
            {order.factura.correo_enviado ? 'Sí' : 'No'}
          </p>

          {order.factura.pdf_url && (
            <a
              href={`http://localhost:3000${order.factura.pdf_url}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-semibold underline"
            >
              Ver PDF
            </a>
          )}
        </div>
      )}

      <div className="mt-6">
        <label className="text-sm font-medium">Observación de acción</label>
        <textarea
          value={observacion}
          onChange={(event) => onChangeObservacion(event.target.value)}
          className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Ejemplo: pedido confirmado por WhatsApp"
        />
      </div>

      <div className="mt-6 grid gap-3">
        {pedido.estado === 'PENDIENTE' && (
          <>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirmar pedido
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Cancelar pedido
            </button>
          </>
        )}

        {pedido.estado === 'CONFIRMADO' && (
          <>
            <button
              onClick={onDeliver}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
              Marcar como entregado
            </button>

            <button
              onClick={onSendInvoice}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Enviar factura por correo
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Cancelar pedido
            </button>
          </>
        )}

        {pedido.estado === 'ENTREGADO' && (
          <button
            onClick={onSendInvoice}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Enviar factura por correo
          </button>
        )}
      </div>
    </div>
  );
}