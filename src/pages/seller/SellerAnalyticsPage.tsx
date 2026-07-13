import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  Package,
  RefreshCcw,
  ShoppingBag,
  Store,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { getMyStores } from '../../api/store.api';
import { getSellerDashboardByStore } from '../../api/order.api';

import type { Store as StoreType } from '../../types/store.types';
import type { SellerDashboardData } from '../../types/dashboard.types';

import { getErrorMessage } from '../../utils/getErrorMessage';

export function SellerAnalyticsPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [dashboard, setDashboard] = useState<SellerDashboardData | null>(null);

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadDashboard(selectedStoreId);
    }
  }, [selectedStoreId]);

  async function loadStores() {
    try {
      setLoadingStores(true);
      setError('');

      const data = await getMyStores();
      const activeStores = data.filter((store) => store.estado === 'ACTIVA');

      setStores(activeStores);

      if (activeStores.length > 0) {
        setSelectedStoreId(activeStores[0].id_tienda);
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar tus tiendas.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoadingStores(false);
    }
  }

  async function loadDashboard(storeId: string) {
    try {
      setLoadingDashboard(true);
      setError('');

      const data = await getSellerDashboardByStore(storeId);
      setDashboard(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo cargar el resumen de la tienda.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoadingDashboard(false);
    }
  }

  const resumen = dashboard?.resumen;

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Resumen del vendedor</h1>
          <p className="mt-2 text-slate-600">
            Consulta pedidos, ventas, productos activos y stock bajo por tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => selectedStoreId && loadDashboard(selectedStoreId)}
          disabled={!selectedStoreId || loadingDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
        >
          {loadingDashboard ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loadingStores ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          Cargando tiendas...
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Store className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No tienes tiendas activas</h2>
          <p className="mt-2 text-slate-600">
            Primero necesitas una tienda aprobada para ver el resumen.
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

          {loadingDashboard || !dashboard || !resumen ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-3">Cargando resumen...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                  title="Pendientes"
                  value={resumen.pedidos_pendientes}
                  description="Pedidos por revisar"
                  icon={Clock3}
                  tone="yellow"
                />

                <DashboardCard
                  title="Confirmados"
                  value={resumen.pedidos_confirmados}
                  description="Pedidos confirmados"
                  icon={CheckCircle2}
                  tone="blue"
                />

                <DashboardCard
                  title="Entregados"
                  value={resumen.pedidos_entregados}
                  description="Pedidos completados"
                  icon={Package}
                  tone="green"
                />

                <DashboardCard
                  title="Cancelados"
                  value={resumen.pedidos_cancelados}
                  description="Pedidos cancelados"
                  icon={XCircle}
                  tone="red"
                />

                <DashboardCard
                  title="Pedidos de hoy"
                  value={resumen.pedidos_hoy}
                  description="Pedidos recibidos hoy"
                  icon={ShoppingBag}
                  tone="slate"
                />

                <DashboardCard
                  title="Ventas de hoy"
                  value={`$${Number(resumen.ventas_hoy).toFixed(2)}`}
                  description="Ventas confirmadas o entregadas"
                  icon={DollarSign}
                  tone="green"
                />

                <DashboardCard
                  title="Ventas totales"
                  value={`$${Number(resumen.ventas_totales).toFixed(2)}`}
                  description="Acumulado de ventas"
                  icon={BarChart3}
                  tone="slate"
                />

                <DashboardCard
                  title="Productos activos"
                  value={resumen.productos_activos}
                  description="Productos visibles en tienda"
                  icon={Package}
                  tone="blue"
                />
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">Productos con bajo stock</h2>
                      <p className="text-sm text-slate-600">
                        Productos o variantes con 5 unidades o menos.
                      </p>
                    </div>
                  </div>

                  {dashboard.bajo_stock.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-600">
                      No hay productos con bajo stock.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {dashboard.bajo_stock.map((item) => (
                        <div
                          key={`${item.id_producto}-${item.id_variante ?? 'simple'}`}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold">{item.producto}</p>

                              {(item.talla || item.color) && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.talla ? `Talla: ${item.talla}` : ''}
                                  {item.talla && item.color ? ' | ' : ''}
                                  {item.color ? `Color: ${item.color}` : ''}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-slate-500">
                                Tipo: {item.tipo}
                              </p>
                            </div>

                            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                              Stock: {item.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white">
                      <ShoppingBag className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">Últimos pedidos</h2>
                      <p className="text-sm text-slate-600">
                        Pedidos recientes de esta tienda.
                      </p>
                    </div>
                  </div>

                  {dashboard.ultimos_pedidos.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-600">
                      Todavía no hay pedidos.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {dashboard.ultimos_pedidos.map((order) => (
                        <div
                          key={order.id_pedido}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold">{order.cliente_nombre}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {order.cliente_telefono}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {new Date(order.fecha_creacion).toLocaleString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {order.estado}
                              </span>

                              <p className="mt-2 font-bold">
                                ${Number(order.total).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  tone: 'yellow' | 'blue' | 'green' | 'red' | 'slate';
}

const cardTones: Record<
  DashboardCardProps['tone'],
  {
    icon: string;
    value: string;
  }
> = {
  yellow: {
    icon: 'bg-yellow-50 text-yellow-700',
    value: 'text-yellow-700'
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    value: 'text-blue-700'
  },
  green: {
    icon: 'bg-green-50 text-green-700',
    value: 'text-green-700'
  },
  red: {
    icon: 'bg-red-50 text-red-700',
    value: 'text-red-700'
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700',
    value: 'text-slate-900'
  }
};

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone
}: DashboardCardProps) {
  const styles = cardTones[tone];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${styles.value}`}>
            {value}
          </p>
        </div>

        <div className={`rounded-2xl p-3 ${styles.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </article>
  );
}