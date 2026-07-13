import { useEffect, useState, type ElementType } from 'react';
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
  UserRound,
  Users,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { getAdminDashboard } from '../../api/store.api';
import type { AdminDashboardData } from '../../types/admin-dashboard.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState('');

  useEffect(() => {
    loadDashboard(selectedStoreId);
  }, [selectedStoreId]);

  async function loadDashboard(storeId = selectedStoreId) {
    try {
      setLoading(true);

      const data = await getAdminDashboard(storeId || undefined);
      setDashboard(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo cargar el dashboard del administrador.'
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const resumen = dashboard?.resumen;

  const selectedStore = dashboard?.tiendas_disponibles.find(
    (store) => store.id_tienda === selectedStoreId
  );

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedStoreId ? 'Dashboard por tienda' : 'Dashboard administrativo'}
          </h1>

          <p className="mt-2 text-slate-600">
            {selectedStoreId && selectedStore
              ? `Resumen específico de ${selectedStore.nombre_comercial || selectedStore.nombre}.`
              : 'Revisa el estado general de tiendas, usuarios, pedidos y ventas.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      {dashboard && (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium">Ver dashboard por tienda</label>

          <select
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          >
            <option value="">Todas las tiendas</option>

            {dashboard.tiendas_disponibles.map((store) => (
              <option key={store.id_tienda} value={store.id_tienda}>
                {store.nombre_comercial || store.nombre} — {store.estado}
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm text-slate-500">
            Puedes ver el resumen general o filtrar la información por una tienda específica.
          </p>
        </div>
      )}

      {loading || !dashboard || !resumen ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3">Cargando información...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminCard
              title="Tiendas pendientes"
              value={resumen.tiendas_pendientes}
              description={
                selectedStoreId
                  ? 'Estado de la tienda seleccionada'
                  : 'Solicitudes por revisar'
              }
              icon={Clock3}
              tone="yellow"
            />

            <AdminCard
              title="Tiendas activas"
              value={resumen.tiendas_activas}
              description={
                selectedStoreId
                  ? 'Estado de la tienda seleccionada'
                  : 'Tiendas aprobadas'
              }
              icon={CheckCircle2}
              tone="green"
            />

            <AdminCard
              title="Tiendas rechazadas"
              value={resumen.tiendas_rechazadas}
              description={
                selectedStoreId
                  ? 'Estado de la tienda seleccionada'
                  : 'Solicitudes rechazadas'
              }
              icon={XCircle}
              tone="red"
            />

            <AdminCard
              title="Tiendas suspendidas"
              value={resumen.tiendas_suspendidas}
              description={
                selectedStoreId
                  ? 'Estado de la tienda seleccionada'
                  : 'Tiendas no disponibles'
              }
              icon={AlertTriangle}
              tone="orange"
            />

            <AdminCard
              title="Vendedores"
              value={resumen.vendedores}
              description={
                selectedStoreId
                  ? 'Dueño de la tienda seleccionada'
                  : 'Usuarios vendedores'
              }
              icon={Users}
              tone="blue"
            />

            <AdminCard
              title="Clientes"
              value={resumen.clientes}
              description={
                selectedStoreId
                  ? 'Clientes con pedidos en esta tienda'
                  : 'Clientes registrados o compradores'
              }
              icon={UserRound}
              tone="slate"
            />

            <AdminCard
              title="Productos activos"
              value={resumen.productos_activos}
              description={
                selectedStoreId
                  ? 'Productos activos de esta tienda'
                  : 'Productos publicados'
              }
              icon={Package}
              tone="blue"
            />

            <AdminCard
              title="Pedidos de hoy"
              value={resumen.pedidos_hoy}
              description={
                selectedStoreId
                  ? 'Pedidos de hoy en esta tienda'
                  : 'Pedidos registrados hoy'
              }
              icon={ShoppingBag}
              tone="slate"
            />

            <AdminCard
              title="Ventas de hoy"
              value={`$${Number(resumen.ventas_hoy).toFixed(2)}`}
              description={
                selectedStoreId
                  ? 'Ventas de hoy de esta tienda'
                  : 'Confirmadas o entregadas'
              }
              icon={DollarSign}
              tone="green"
            />

            <AdminCard
              title="Ventas totales"
              value={`$${Number(resumen.ventas_totales).toFixed(2)}`}
              description={
                selectedStoreId
                  ? 'Acumulado de esta tienda'
                  : 'Acumulado general'
              }
              icon={BarChart3}
              tone="slate"
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <Store className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {selectedStoreId ? 'Tienda seleccionada' : 'Últimas tiendas'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {selectedStoreId
                      ? 'Información de la tienda filtrada.'
                      : 'Tiendas registradas recientemente.'}
                  </p>
                </div>
              </div>

              {dashboard.ultimas_tiendas.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-600">
                  No hay tiendas para mostrar.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {dashboard.ultimas_tiendas.map((store) => (
                    <div
                      key={store.id_tienda}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold">
                            {store.nombre_comercial || store.nombre}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            /{store.slug}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(store.fecha_creacion).toLocaleString()}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {store.estado}
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
                    {selectedStoreId
                      ? 'Pedidos recientes de esta tienda.'
                      : 'Pedidos recientes de todas las tiendas.'}
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
                            {order.nombre_tienda}
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
    </section>
  );
}

interface AdminCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  tone: 'yellow' | 'green' | 'red' | 'orange' | 'blue' | 'slate';
}

const adminCardTones: Record<
  AdminCardProps['tone'],
  {
    icon: string;
    value: string;
  }
> = {
  yellow: {
    icon: 'bg-yellow-50 text-yellow-700',
    value: 'text-yellow-700'
  },
  green: {
    icon: 'bg-green-50 text-green-700',
    value: 'text-green-700'
  },
  red: {
    icon: 'bg-red-50 text-red-700',
    value: 'text-red-700'
  },
  orange: {
    icon: 'bg-orange-50 text-orange-700',
    value: 'text-orange-700'
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    value: 'text-blue-700'
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700',
    value: 'text-slate-900'
  }
};

function AdminCard({
  title,
  value,
  description,
  icon: Icon,
  tone
}: AdminCardProps) {
  const styles = adminCardTones[tone];

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