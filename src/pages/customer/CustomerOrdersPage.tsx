import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  Package,
  RefreshCcw,
  ShoppingBag,
  Store,
  X,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import {
  getCustomerOrderDetail,
  getCustomerOrders
} from '../../api/customer-order.api';
import type {
  CustomerOrder,
  CustomerOrderDetail,
  CustomerOrderStatus
} from '../../types/customer-order.types';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';

const statusStyles: Record<CustomerOrderStatus, string> = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200',
  ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200'
};

const statusIcons: Record<CustomerOrderStatus, typeof Clock> = {
  PENDIENTE: Clock,
  CONFIRMADO: CheckCircle2,
  ENTREGADO: Package,
  CANCELADO: XCircle
};

const statusFilters: Array<{
  value: 'TODOS' | CustomerOrderStatus;
  label: string;
}> = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'CONFIRMADO', label: 'Confirmados' },
    { value: 'ENTREGADO', label: 'Entregados' },
    { value: 'CANCELADO', label: 'Cancelados' }
  ];

function money(value: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<'TODOS' | CustomerOrderStatus>('TODOS');

  const [selectedOrder, setSelectedOrder] =
    useState<CustomerOrderDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const data = await getCustomerOrders();
      setOrders(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar tus pedidos.'
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetail(orderId: string) {
    try {
      setDetailLoading(orderId);

      const data = await getCustomerOrderDetail(orderId);
      setSelectedOrder(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo cargar el detalle del pedido.'
      );

      toast.error(message);
    } finally {
      setDetailLoading('');
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus === 'TODOS') return true;
      return order.estado === selectedStatus;
    });
  }, [orders, selectedStatus]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.estado === 'PENDIENTE'
  ).length;
  const confirmedOrders = orders.filter(
    (order) => order.estado === 'CONFIRMADO'
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.estado === 'ENTREGADO'
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis pedidos</h1>
          <p className="mt-2 text-slate-600">
            Revisa el estado de tus compras y consulta el detalle de cada pedido.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total"
          value={totalOrders}
          description="Pedidos realizados"
          icon={ShoppingBag}
        />

        <SummaryCard
          title="Pendientes"
          value={pendingOrders}
          description="En espera de revisión"
          icon={Clock}
        />

        <SummaryCard
          title="Confirmados"
          value={confirmedOrders}
          description="Aprobados por la tienda"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Entregados"
          value={deliveredOrders}
          description="Pedidos finalizados"
          icon={Package}
        />
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium">Filtrar por estado</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedStatus(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedStatus === filter.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Mostrando {filteredOrders.length} de {orders.length} pedidos.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3">Cargando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />

          <h2 className="mt-4 text-xl font-bold">
            No tienes pedidos para mostrar
          </h2>

          <p className="mt-2 text-slate-600">
            Cuando realices una compra con tu cuenta, aparecerá aquí.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredOrders.map((order) => (
            <CustomerOrderCard
              key={order.id_pedido}
              order={order}
              loading={detailLoading === order.id_pedido}
              onView={() => handleViewDetail(order.id_pedido)}
            />
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          data={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

interface CustomerOrderCardProps {
  order: CustomerOrder;
  loading: boolean;
  onView: () => void;
}

function CustomerOrderCard({
  order,
  loading,
  onView
}: CustomerOrderCardProps) {
  const StatusIcon = statusIcons[order.estado] || Clock;
  const color = order.color_principal || '#111827';

  return (
    <article
      className="rounded-3xl border bg-white p-5 shadow-sm"
      style={{ borderColor: '#e2e8f0' }}
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
            {order.logo_url ? (
              <img
                src={assetUrl(order.logo_url)}
                alt={order.nombre_tienda}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="h-7 w-7 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold">
                {order.nombre_tienda}
              </h2>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[order.estado]
                  }`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {order.estado}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Pedido realizado el {formatDate(order.fecha_creacion)}
            </p>
            {order.codigo_seguimiento && (
              <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Código: {order.codigo_seguimiento}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>{order.cantidad_items} producto(s)</span>
              <span>Total: {money(order.total)}</span>
              <span>Factura: {order.factura ? 'Disponible' : 'No generada'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/stores/${order.slug_tienda}`}
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: color,
              color
            }}
          >
            Ver tienda
          </Link>

          <button
            type="button"
            onClick={onView}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  );
}

interface OrderDetailModalProps {
  data: CustomerOrderDetail;
  onClose: () => void;
}

function OrderDetailModal({ data, onClose }: OrderDetailModalProps) {
  const { pedido, detalles, estados, factura } = data;
  const color = pedido.color_principal || '#111827';
  const StatusIcon = statusIcons[pedido.estado] || Clock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"
        >
          <div>
            <h2 className="text-xl font-bold">Detalle del pedido</h2>
            <p className="text-sm text-slate-500">
              {pedido.nombre_tienda} · {formatDate(pedido.fecha_creacion)}
            </p>
            {pedido.codigo_seguimiento && (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Código de seguimiento: {pedido.codigo_seguimiento}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 p-2 hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Tienda</p>
                    <h3 className="text-lg font-bold">{pedido.nombre_tienda}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${statusStyles[pedido.estado]
                      }`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {pedido.estado}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                  <p>
                    <strong>Cliente:</strong> {pedido.cliente_nombre}
                  </p>

                  <p>
                    <strong>Teléfono:</strong> {pedido.cliente_telefono}
                  </p>

                  <p>
                    <strong>Correo:</strong>{' '}
                    {pedido.cliente_correo || 'No registrado'}
                  </p>

                  <p>
                    <strong>Dirección:</strong>{' '}
                    {pedido.cliente_direccion || 'No registrada'}
                  </p>
                </div>

                {pedido.observacion && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <strong>Observación:</strong> {pedido.observacion}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h3 className="font-bold">Productos comprados</h3>

                <div className="mt-4 space-y-3">
                  {detalles.map((item) => (
                    <div
                      key={item.id_pedido_detalle}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="font-semibold">{item.nombre_producto}</p>

                        {(item.talla || item.color) && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.talla ? `Talla: ${item.talla}` : ''}
                            {item.talla && item.color ? ' | ' : ''}
                            {item.color ? `Color: ${item.color}` : ''}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-500">
                          {item.cantidad} x {money(item.precio_unitario)}
                        </p>
                      </div>

                      <p className="font-bold">{money(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h3 className="font-bold">Historial del pedido</h3>

                {estados.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No hay historial registrado.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {estados.map((item, index) => (
                      <div
                        key={`${item.estado_nuevo}-${item.fecha_creacion}-${index}`}
                        className="rounded-2xl bg-slate-50 p-4 text-sm"
                      >
                        <p className="font-semibold">
                          {item.estado_anterior || 'Inicio'} →{' '}
                          {item.estado_nuevo}
                        </p>

                        {item.observacion && (
                          <p className="mt-1 text-slate-600">
                            {item.observacion}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item.fecha_creacion)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-slate-200 p-5">
              <h3 className="text-lg font-bold">Resumen</h3>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <strong>{money(pedido.subtotal)}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Descuento</span>
                  <strong>{money(pedido.descuento)}</strong>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div
                    className="flex justify-between text-lg font-bold"
                    style={{ color }}
                  >
                    <span>Total</span>
                    <span>{money(pedido.total)}</span>
                  </div>
                </div>
              </div>
              {pedido.codigo_seguimiento && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-700">Código de seguimiento</p>
                  <p className="mt-2 break-all font-bold text-slate-900">
                    {pedido.codigo_seguimiento}
                  </p>
                </div>
              )}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold">Datos de la tienda</p>

                <p className="mt-2 text-slate-600">
                  WhatsApp: {pedido.whatsapp || 'No registrado'}
                </p>

                <p className="mt-1 text-slate-600">
                  Correo: {pedido.correo_contacto || 'No registrado'}
                </p>

                <p className="mt-1 text-slate-600">
                  Dirección: {pedido.direccion_tienda || 'No registrada'}
                </p>
              </div>

              <div className="mt-6">
                {factura ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <p className="font-bold">Factura generada</p>

                    <p className="mt-1">
                      Número: {factura.numero_factura}
                    </p>

                    <p className="mt-1">
                      Fecha: {formatDate(factura.fecha_emision)}
                    </p>

                    {factura.pdf_url && (
                      <a
                        href={assetUrl(factura.pdf_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
                      >
                        <FileText className="h-4 w-4" />
                        Ver factura PDF
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                    La factura todavía no ha sido generada por la tienda.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof ShoppingBag;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon
}: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </article>
  );
}