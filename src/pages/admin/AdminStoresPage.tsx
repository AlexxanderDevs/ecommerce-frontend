import { useEffect, useMemo, useState, type ElementType, type FormEvent } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Eye,
    Loader2,
    RefreshCcw,
    Search,
    ShoppingBag,
    Store as StoreIcon,
    UserRound,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import {
    getAdminStores,
    reactivateAdminStore,
    suspendAdminStore
} from '../../api/store.api';

import type { AdminStore } from '../../types/admin-dashboard.types';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';

type StoreStatusFilter =
    | 'TODOS'
    | 'PENDIENTE_REVISION'
    | 'ACTIVA'
    | 'INACTIVA'
    | 'SUSPENDIDA'
    | 'RECHAZADA';

type StoreActionType = 'SUSPEND' | 'REACTIVATE';

interface StoreActionModalState {
    type: StoreActionType;
    store: AdminStore;
}

const statusStyles: Record<AdminStore['estado'], string> = {
    PENDIENTE_REVISION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACTIVA: 'bg-green-50 text-green-700 border-green-200',
    INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
    SUSPENDIDA: 'bg-orange-50 text-orange-700 border-orange-200',
    RECHAZADA: 'bg-red-50 text-red-700 border-red-200',
    ELIMINADA: 'bg-zinc-50 text-zinc-700 border-zinc-200'
};

const statusFilters: Array<{
    value: StoreStatusFilter;
    label: string;
}> = [
        { value: 'TODOS', label: 'Todas' },
        { value: 'PENDIENTE_REVISION', label: 'Pendientes' },
        { value: 'ACTIVA', label: 'Activas' },
        { value: 'INACTIVA', label: 'Inactivas' },
        { value: 'SUSPENDIDA', label: 'Suspendidas' },
        { value: 'RECHAZADA', label: 'Rechazadas' }
    ];

export function AdminStoresPage() {
    const [stores, setStores] = useState<AdminStore[]>([]);
    const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    const [selectedStatus, setSelectedStatus] =
        useState<StoreStatusFilter>('TODOS');

    const [search, setSearch] = useState('');
    const [actionModal, setActionModal] =
        useState<StoreActionModalState | null>(null);

    const [actionObservation, setActionObservation] = useState('');

    useEffect(() => {
        loadStores();
    }, []);

    async function loadStores() {
        try {
            setLoading(true);

            const data = await getAdminStores();
            setStores(data);

            if (selectedStore) {
                const updatedSelectedStore = data.find(
                    (store) => store.id_tienda === selectedStore.id_tienda
                );

                setSelectedStore(updatedSelectedStore ?? null);
            }
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudieron cargar las tiendas.'
            );

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function openSuspendModal(store: AdminStore) {
        setActionModal({
            type: 'SUSPEND',
            store
        });

        setActionObservation('Tienda suspendida por el administrador.');
    }

    function openReactivateModal(store: AdminStore) {
        setActionModal({
            type: 'REACTIVATE',
            store
        });

        setActionObservation('Tienda reactivada por el administrador.');
    }

    function closeActionModal() {
        if (actionLoading) {
            return;
        }

        setActionModal(null);
        setActionObservation('');
    }

    async function handleConfirmStoreAction() {
        if (!actionModal) {
            return;
        }

        const observacion = actionObservation.trim();

        if (observacion.length < 5) {
            toast.error('Escribe un motivo válido.');
            return;
        }

        try {
            setActionLoading(actionModal.store.id_tienda);

            if (actionModal.type === 'SUSPEND') {
                await suspendAdminStore(actionModal.store.id_tienda, observacion);
                toast.success('Tienda suspendida correctamente.');
            } else {
                await reactivateAdminStore(actionModal.store.id_tienda, observacion);
                toast.success('Tienda reactivada correctamente.');
            }

            setActionModal(null);
            setActionObservation('');

            await loadStores();
        } catch (error) {
            const message = getErrorMessage(
                error,
                actionModal.type === 'SUSPEND'
                    ? 'No se pudo suspender la tienda.'
                    : 'No se pudo reactivar la tienda.'
            );

            toast.error(message);
        } finally {
            setActionLoading('');
        }
    }

    const filteredStores = useMemo(() => {
        return stores.filter((store) => {
            const matchesStatus =
                selectedStatus === 'TODOS' || store.estado === selectedStatus;

            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                searchValue.length === 0 ||
                store.nombre.toLowerCase().includes(searchValue) ||
                (store.nombre_comercial ?? '').toLowerCase().includes(searchValue) ||
                store.slug.toLowerCase().includes(searchValue) ||
                store.nombre_duenio.toLowerCase().includes(searchValue) ||
                store.correo_duenio.toLowerCase().includes(searchValue) ||
                store.whatsapp.toLowerCase().includes(searchValue);

            return matchesStatus && matchesSearch;
        });
    }, [stores, selectedStatus, search]);

    const totalStores = stores.length;
    const activeStores = stores.filter((store) => store.estado === 'ACTIVA').length;
    const pendingStores = stores.filter(
        (store) => store.estado === 'PENDIENTE_REVISION'
    ).length;
    const suspendedStores = stores.filter(
        (store) => store.estado === 'SUSPENDIDA'
    ).length;

    return (
        <section>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de tiendas</h1>
                    <p className="mt-2 text-slate-600">
                        Administra las tiendas registradas, revisa su información y controla su estado.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadStores}
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

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Total tiendas"
                    value={totalStores}
                    description="Tiendas registradas"
                    icon={StoreIcon}
                    tone="slate"
                />

                <SummaryCard
                    title="Activas"
                    value={activeStores}
                    description="Disponibles públicamente"
                    icon={CheckCircle2}
                    tone="green"
                />

                <SummaryCard
                    title="Pendientes"
                    value={pendingStores}
                    description="Solicitudes por revisar"
                    icon={AlertTriangle}
                    tone="yellow"
                />

                <SummaryCard
                    title="Suspendidas"
                    value={suspendedStores}
                    description="Tiendas bloqueadas"
                    icon={XCircle}
                    tone="orange"
                />
            </div>

            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <label className="text-sm font-medium">Buscar tienda</label>

                        <div className="relative mt-2">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-900"
                                placeholder="Buscar por tienda, dueño, correo, slug o WhatsApp..."
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch('');
                            setSelectedStatus('TODOS');
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
                    >
                        Limpiar filtros
                    </button>
                </div>

                <div className="mt-5">
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
                </div>

                <p className="mt-4 text-sm text-slate-500">
                    Mostrando {filteredStores.length} de {stores.length} tiendas.
                </p>
            </div>

            {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-3">Cargando tiendas...</p>
                </div>
            ) : filteredStores.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                    <StoreIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h2 className="mt-4 text-xl font-bold">No hay tiendas para mostrar</h2>
                    <p className="mt-2 text-slate-600">
                        Cambia los filtros o intenta con otra búsqueda.
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
                    <div className="grid gap-4">
                        {filteredStores.map((store) => (
                            <AdminStoreCard
                                key={store.id_tienda}
                                store={store}
                                loading={actionLoading === store.id_tienda}
                                onView={() => setSelectedStore(store)}
                                onSuspend={() => openSuspendModal(store)}
                                onReactivate={() => openReactivateModal(store)}
                            />
                        ))}
                    </div>

                    <div>
                        {!selectedStore ? (
                            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                                <Eye className="mx-auto h-10 w-10 text-slate-400" />
                                <p className="mt-3">
                                    Selecciona una tienda para ver su información completa.
                                </p>
                            </div>
                        ) : (
                            <StoreDetailPanel
                                store={selectedStore}
                                loading={actionLoading === selectedStore.id_tienda}
                                onSuspend={() => openSuspendModal(selectedStore)}
                                onReactivate={() => openReactivateModal(selectedStore)}
                            />
                        )}
                    </div>
                </div>
            )}
            {actionModal && (
                <StoreActionModal
                    modal={actionModal}
                    observation={actionObservation}
                    loading={actionLoading === actionModal.store.id_tienda}
                    onChangeObservation={setActionObservation}
                    onClose={closeActionModal}
                    onConfirm={handleConfirmStoreAction}
                />
            )}
        </section>
    );
}

interface AdminStoreCardProps {
    store: AdminStore;
    loading: boolean;
    onView: () => void;
    onSuspend: () => void;
    onReactivate: () => void;
}

function AdminStoreCard({
    store,
    loading,
    onView,
    onSuspend,
    onReactivate
}: AdminStoreCardProps) {
    const canSuspend =
        store.estado === 'ACTIVA' ||
        store.estado === 'INACTIVA' ||
        store.estado === 'PENDIENTE_REVISION';

    const canReactivate =
        store.estado === 'SUSPENDIDA' || store.estado === 'INACTIVA';

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {store.portada_url ? (
                <img
                    src={assetUrl(store.portada_url)}
                    alt={store.nombre}
                    className="h-36 w-full object-cover"
                />
            ) : (
                <div
                    className="h-36 w-full"
                    style={{ backgroundColor: store.color_principal || '#111827' }}
                />
            )}

            <div className="p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex min-w-0 gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            {store.logo_url ? (
                                <img
                                    src={assetUrl(store.logo_url)}
                                    alt={store.nombre}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <StoreIcon className="h-7 w-7 text-slate-400" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold">
                                {store.nombre_comercial || store.nombre}
                            </h3>

                            <p className="text-sm text-slate-500">/{store.slug}</p>

                            <span
                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[store.estado]
                                    }`}
                            >
                                {store.estado}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onView}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            <Eye className="h-4 w-4" />
                            Ver
                        </button>

                        {canSuspend && (
                            <button
                                type="button"
                                onClick={onSuspend}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                Suspender
                            </button>
                        )}

                        {canReactivate && (
                            <button
                                type="button"
                                onClick={onReactivate}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Reactivar
                            </button>
                        )}
                    </div>
                </div>

                {store.descripcion && (
                    <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                        {store.descripcion}
                    </p>
                )}

                <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <p>
                        <strong>Dueño:</strong> {store.nombre_duenio}
                    </p>

                    <p>
                        <strong>Productos:</strong> {store.cantidad_productos}
                    </p>

                    <p>
                        <strong>Pedidos:</strong> {store.cantidad_pedidos}
                    </p>

                    <p>
                        <strong>Ventas:</strong> ${Number(store.ventas_totales).toFixed(2)}
                    </p>

                    <p>
                        <strong>WhatsApp:</strong> {store.whatsapp}
                    </p>

                    <p>
                        <strong>Creada:</strong>{' '}
                        {new Date(store.fecha_creacion).toLocaleDateString()}
                    </p>
                </div>

                {store.estado === 'ACTIVA' && (
                    <a
                        href={`/stores/${store.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Ver tienda pública
                    </a>
                )}
            </div>
        </article>
    );
}

interface StoreDetailPanelProps {
    store: AdminStore;
    loading: boolean;
    onSuspend: () => void;
    onReactivate: () => void;
}

function StoreDetailPanel({
    store,
    loading,
    onSuspend,
    onReactivate
}: StoreDetailPanelProps) {
    const canSuspend =
        store.estado === 'ACTIVA' ||
        store.estado === 'INACTIVA' ||
        store.estado === 'PENDIENTE_REVISION';

    const canReactivate =
        store.estado === 'SUSPENDIDA' || store.estado === 'INACTIVA';

    return (
        <aside className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {store.logo_url ? (
                        <img
                            src={assetUrl(store.logo_url)}
                            alt={store.nombre}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <StoreIcon className="h-7 w-7 text-slate-400" />
                    )}
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold">
                        {store.nombre_comercial || store.nombre}
                    </h2>

                    <p className="text-sm text-slate-500">/{store.slug}</p>

                    <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[store.estado]
                            }`}
                    >
                        {store.estado}
                    </span>
                </div>
            </div>

            {store.descripcion && (
                <p className="mt-5 text-sm text-slate-600">{store.descripcion}</p>
            )}

            <div className="my-6 border-t border-slate-200" />

            <div className="space-y-3 text-sm text-slate-700">
                <p>
                    <strong>Dueño:</strong> {store.nombre_duenio}
                </p>

                <p>
                    <strong>Correo dueño:</strong> {store.correo_duenio}
                </p>

                <p>
                    <strong>WhatsApp:</strong> {store.whatsapp}
                </p>

                <p>
                    <strong>Correo contacto:</strong>{' '}
                    {store.correo_contacto || 'No registrado'}
                </p>

                <p>
                    <strong>Dirección:</strong> {store.direccion || 'No registrada'}
                </p>

                <p>
                    <strong>Productos:</strong> {store.cantidad_productos}
                </p>

                <p>
                    <strong>Pedidos:</strong> {store.cantidad_pedidos}
                </p>

                <p>
                    <strong>Ventas totales:</strong> $
                    {Number(store.ventas_totales).toFixed(2)}
                </p>

                <p>
                    <strong>Fecha creación:</strong>{' '}
                    {new Date(store.fecha_creacion).toLocaleString()}
                </p>
            </div>

            <div className="mt-6 grid gap-3">
                {store.estado === 'ACTIVA' && (
                    <a
                        href={`/stores/${store.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Ver tienda pública
                    </a>
                )}

                {canSuspend && (
                    <button
                        type="button"
                        onClick={onSuspend}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        Suspender tienda
                    </button>
                )}

                {canReactivate && (
                    <button
                        type="button"
                        onClick={onReactivate}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Reactivar tienda
                    </button>
                )}
            </div>
        </aside>
    );
}

interface StoreActionModalProps {
  modal: StoreActionModalState;
  observation: string;
  loading: boolean;
  onChangeObservation: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function StoreActionModal({
  modal,
  observation,
  loading,
  onChangeObservation,
  onClose,
  onConfirm
}: StoreActionModalProps) {
  const isSuspend = modal.type === 'SUSPEND';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-2xl p-3 ${
              isSuspend
                ? 'bg-orange-50 text-orange-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {isSuspend ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">
              {isSuspend ? 'Suspender tienda' : 'Reactivar tienda'}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {isSuspend
                ? 'Escribe el motivo por el cual se suspenderá esta tienda.'
                : 'Escribe el motivo por el cual se reactivará esta tienda.'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold">
            {modal.store.nombre_comercial || modal.store.nombre}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            /{modal.store.slug}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Estado actual: {modal.store.estado}
          </p>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium">
            Motivo de {isSuspend ? 'suspensión' : 'reactivación'}
          </label>

          <textarea
            value={observation}
            onChange={(event) => onChangeObservation(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder={
              isSuspend
                ? 'Ejemplo: La tienda incumple las políticas de publicación.'
                : 'Ejemplo: La tienda corrigió la información solicitada.'
            }
            required
          />

          <p className="mt-2 text-xs text-slate-500">
            Este motivo quedará registrado en la revisión de la tienda.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-60 ${
              isSuspend
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSuspend ? 'Suspender tienda' : 'Reactivar tienda'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface SummaryCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: ElementType;
    tone: 'yellow' | 'green' | 'orange' | 'slate';
}

const summaryTones: Record<
    SummaryCardProps['tone'],
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
    orange: {
        icon: 'bg-orange-50 text-orange-700',
        value: 'text-orange-700'
    },
    slate: {
        icon: 'bg-slate-100 text-slate-700',
        value: 'text-slate-900'
    }
};

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    tone
}: SummaryCardProps) {
    const styles = summaryTones[tone];

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