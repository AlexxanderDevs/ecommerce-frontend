import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    Bell,
    CheckCircle2,
    Eye,
    Loader2,
    RefreshCcw,
    Store,
    XCircle
} from 'lucide-react';
import {
    approveStore,
    getAdminNotifications,
    getPendingStores,
    rejectStore,
    type AdminNotification
} from '../../api/store.api';
import type { Store as StoreType } from '../../types/store.types';
import { assetUrl } from '../../utils/assets';
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
    const [stores, setStores] = useState<StoreType[]>([]);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
    const [observacion, setObservacion] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadAdminData();
    }, []);

    async function loadAdminData() {
        try {
            setLoading(true);
            setError('');

            const [pendingStores, adminNotifications] = await Promise.all([
                getPendingStores(),
                getAdminNotifications()
            ]);

            setStores(pendingStores);
            setNotifications(adminNotifications);
        } catch {
            setError('No se pudo cargar la información administrativa.');
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(store: StoreType) {
        try {
            setActionLoading(store.id_tienda);
            setError('');
            setMessage('');

            const response = await approveStore(
                store.id_tienda,
                observacion || 'La tienda cumple con los requisitos.'
            );

            setMessage(`La tienda ${response.store.nombre} fue aprobada correctamente.`);
            setSelectedStore(null);
            setObservacion('');

            await loadAdminData();
        } catch {
            setError('No se pudo aprobar la tienda.');
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReject(event: FormEvent, store: StoreType) {
        event.preventDefault();

        try {
            setActionLoading(store.id_tienda);
            setError('');
            setMessage('');

            const response = await rejectStore(
                store.id_tienda,
                observacion || 'La solicitud de tienda fue rechazada.'
            );

            setMessage(`La tienda ${response.store.nombre} fue rechazada.`);
            setSelectedStore(null);
            setObservacion('');

            await loadAdminData();
        } catch {
            setError('No se pudo rechazar la tienda.');
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Panel administrador</h1>
                    <p className="mt-2 text-slate-600">
                        Revisa, aprueba o rechaza las solicitudes de tiendas creadas por vendedores.
                    </p>
                </div>
                <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Ver dashboard administrativo
                </Link>
                <Link
                    to="/admin/stores"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                    Gestionar tiendas
                </Link>
                <Link
                    to="/admin/users"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                    Gestionar usuarios
                </Link>
                <Link
                    to="/admin/reports"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                    Ver reportes
                </Link>

                <button
                    onClick={loadAdminData}
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

            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Tiendas pendientes"
                    value={stores.length}
                    icon={<Store className="h-6 w-6" />}
                />

                <SummaryCard
                    title="Notificaciones"
                    value={notifications.length}
                    icon={<Bell className="h-6 w-6" />}
                />

                <SummaryCard
                    title="Revisión manual"
                    value="Activa"
                    icon={<CheckCircle2 className="h-6 w-6" />}
                />
            </div>

            {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    Cargando solicitudes...
                </div>
            ) : stores.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="mt-4 text-xl font-bold">No hay tiendas pendientes</h2>
                    <p className="mt-2 text-slate-600">
                        Cuando un vendedor cree una nueva tienda, aparecerá aquí para revisión.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {stores.map((store) => (
                        <AdminStoreCard
                            key={store.id_tienda}
                            store={store}
                            selected={selectedStore?.id_tienda === store.id_tienda}
                            actionLoading={actionLoading === store.id_tienda}
                            observacion={observacion}
                            onChangeObservation={setObservacion}
                            onSelect={() => {
                                setSelectedStore(
                                    selectedStore?.id_tienda === store.id_tienda ? null : store
                                );
                                setObservacion('');
                            }}
                            onApprove={() => handleApprove(store)}
                            onReject={(event) => handleReject(event, store)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

interface SummaryCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

function SummaryCard({ title, value, icon }: SummaryCardProps) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                </div>

                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    {icon}
                </div>
            </div>
        </article>
    );
}

interface AdminStoreCardProps {
    store: StoreType;
    selected: boolean;
    actionLoading: boolean;
    observacion: string;
    onChangeObservation: (value: string) => void;
    onSelect: () => void;
    onApprove: () => void;
    onReject: (event: FormEvent) => void;
}

function AdminStoreCard({
    store,
    selected,
    actionLoading,
    observacion,
    onChangeObservation,
    onSelect,
    onApprove,
    onReject
}: AdminStoreCardProps) {
    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[280px_1fr]">

                <div className="relative h-56 bg-slate-100 lg:h-full">
                    {store.portada_url ? (
                        <img
                            src={assetUrl(store.portada_url)}
                            alt={store.nombre}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="h-full w-full"
                            style={{ backgroundColor: store.color_principal }}
                        />
                    )}

                    <div className="absolute bottom-4 left-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow">
                        {store.logo_url ? (
                            <img
                                src={assetUrl(store.logo_url)}
                                alt={store.nombre}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Store className="h-8 w-8 text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold">{store.nombre}</h2>

                                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                                    {store.estado}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">/{store.slug}</p>

                            {store.descripcion && (
                                <p className="mt-4 max-w-2xl text-slate-600">
                                    {store.descripcion}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onSelect}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            <Eye className="h-4 w-4" />
                            {selected ? 'Ocultar' : 'Revisar'}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                        <p>
                            <strong>WhatsApp:</strong> {store.whatsapp}
                        </p>

                        <p>
                            <strong>Correo:</strong> {store.correo_contacto || 'No registrado'}
                        </p>

                        <p>
                            <strong>Dirección:</strong> {store.direccion || 'No registrada'}
                        </p>

                        <p>
                            <strong>Color:</strong> {store.color_principal}
                        </p>
                    </div>

                    {store.etiqueta_url && (
                        <div className="mt-6">
                            <p className="mb-2 text-sm font-medium">Etiqueta o sello para factura</p>
                            <img
                                src={assetUrl(store.etiqueta_url)}
                                alt="Etiqueta de tienda"
                                className="h-20 rounded-xl border border-slate-200 object-contain p-2"
                            />
                        </div>
                    )}

                    {selected && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <label className="text-sm font-medium">
                                Observación administrativa
                            </label>

                            <textarea
                                value={observacion}
                                onChange={(e) => onChangeObservation(e.target.value)}
                                className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Ejemplo: La tienda cumple con los requisitos y fue aprobada."
                            />

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    onClick={onApprove}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    Aprobar tienda
                                </button>

                                <form onSubmit={onReject}>
                                    <button
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        Rechazar tienda
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}