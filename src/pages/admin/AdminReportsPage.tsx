import { useEffect, useState, type ElementType, type FormEvent } from 'react';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    DollarSign,
    FileSpreadsheet,
    FileText,
    Loader2,
    Package,
    RefreshCcw,
    ShoppingBag,
    Store,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { getAdminReport } from '../../api/report.api';
import { getAdminDashboard } from '../../api/store.api';
import type { AdminReportData } from '../../types/report.types';
import type { AdminDashboardStoreOption } from '../../types/admin-dashboard.types';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { exportAdminReportToExcel } from '../../utils/reportExcel';
import { exportAdminReportToPdf } from '../../utils/reportPdf';

function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function money(value: string | number) {
    return `$${Number(value || 0).toFixed(2)}`;
}

const statusStyles: Record<string, string> = {
    PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    CONFIRMADO: 'bg-blue-50 text-blue-700 border-blue-200',
    ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
    CANCELADO: 'bg-red-50 text-red-700 border-red-200'
};

export function AdminReportsPage() {
    const [report, setReport] = useState<AdminReportData | null>(null);
    const [stores, setStores] = useState<AdminDashboardStoreOption[]>([]);

    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getTodayDate());
    const [selectedStoreId, setSelectedStoreId] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        try {
            setLoading(true);

            const [reportData, dashboardData] = await Promise.all([
                getAdminReport({
                    startDate,
                    endDate,
                    storeId: selectedStoreId || undefined
                }),
                getAdminDashboard()
            ]);

            setReport(reportData);
            setStores(dashboardData.tiendas_disponibles);
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudo cargar el reporte administrativo.'
            );

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function loadReport() {
        try {
            setLoading(true);

            const reportData = await getAdminReport({
                startDate,
                endDate,
                storeId: selectedStoreId || undefined
            });

            setReport(reportData);
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudo cargar el reporte administrativo.'
            );

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        loadReport();
    }

    const resumen = report?.resumen;

    function handleExportExcel() {
        if (!report) {
            toast.error('Primero genera un reporte.');
            return;
        }

        const selectedStore = stores.find(
            (store) => store.id_tienda === selectedStoreId
        );

        exportAdminReportToExcel(report, {
            startDate,
            endDate,
            storeName: selectedStore
                ? selectedStore.nombre_comercial || selectedStore.nombre
                : undefined
        });

        toast.success('Reporte exportado a Excel.');
    }

    function handleExportPdf() {
        if (!report) {
            toast.error('Primero genera un reporte.');
            return;
        }

        const selectedStore = stores.find(
            (store) => store.id_tienda === selectedStoreId
        );

        exportAdminReportToPdf(report, {
            startDate,
            endDate,
            storeName: selectedStore
                ? selectedStore.nombre_comercial || selectedStore.nombre
                : undefined
        });

        toast.success('Reporte exportado a PDF.');
    }

    return (
        <section>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reportes administrativos</h1>
                    <p className="mt-2 text-slate-600">
                        Analiza ventas, pedidos, productos y tiendas dentro de un rango de fechas.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={loading || !report}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar Excel
                </button>

                <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={loading || !report}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                    <FileText className="h-4 w-4" />
                    Exportar PDF
                </button>

                <button
                    type="button"
                    onClick={loadReport}
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

            <form
                onSubmit={handleSubmit}
                className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end">
                    <div>
                        <label className="text-sm font-medium">Fecha inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tienda</label>
                        <select
                            value={selectedStoreId}
                            onChange={(event) => setSelectedStoreId(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        >
                            <option value="">Todas las tiendas</option>

                            {stores.map((store) => (
                                <option key={store.id_tienda} value={store.id_tienda}>
                                    {store.nombre_comercial || store.nombre} — {store.estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CalendarDays className="h-4 w-4" />
                        )}
                        Generar
                    </button>
                </div>
            </form>

            {loading || !report || !resumen ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-3">Cargando reporte...</p>
                </div>
            ) : (
                <>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <ReportCard
                            title="Total pedidos"
                            value={resumen.total_pedidos}
                            description="Pedidos en el rango"
                            icon={ShoppingBag}
                            tone="slate"
                        />

                        <ReportCard
                            title="Ventas confirmadas"
                            value={money(resumen.ventas_confirmadas)}
                            description="Confirmados y entregados"
                            icon={DollarSign}
                            tone="green"
                        />

                        <ReportCard
                            title="Ventas canceladas"
                            value={money(resumen.ventas_perdidas_canceladas)}
                            description="Pedidos cancelados"
                            icon={XCircle}
                            tone="red"
                        />

                        <ReportCard
                            title="Ticket promedio"
                            value={money(resumen.ticket_promedio)}
                            description="Promedio por venta"
                            icon={TrendingUp}
                            tone="blue"
                        />

                        <ReportCard
                            title="Pendientes"
                            value={resumen.pedidos_pendientes}
                            description="Pedidos por confirmar"
                            icon={ShoppingBag}
                            tone="yellow"
                        />

                        <ReportCard
                            title="Confirmados"
                            value={resumen.pedidos_confirmados}
                            description="Pedidos confirmados"
                            icon={CheckCircle2}
                            tone="blue"
                        />

                        <ReportCard
                            title="Entregados"
                            value={resumen.pedidos_entregados}
                            description="Pedidos completados"
                            icon={Package}
                            tone="green"
                        />

                        <ReportCard
                            title="Cancelados"
                            value={resumen.pedidos_cancelados}
                            description="Pedidos anulados"
                            icon={XCircle}
                            tone="red"
                        />
                    </div>

                    <div className="grid gap-8 xl:grid-cols-2">
                        <ReportTable
                            title="Ventas por día"
                            description="Pedidos y ventas agrupados por fecha."
                            icon={BarChart3}
                        >
                            {report.ventas_por_dia.length === 0 ? (
                                <EmptyText text="No hay ventas en este rango." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500">
                                                <th className="py-3">Fecha</th>
                                                <th className="py-3">Pedidos</th>
                                                <th className="py-3">Ventas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.ventas_por_dia.map((day) => (
                                                <tr key={day.fecha} className="border-b border-slate-100">
                                                    <td className="py-3">{new Date(day.fecha).toLocaleDateString()}</td>
                                                    <td className="py-3">{day.total_pedidos}</td>
                                                    <td className="py-3 font-bold">{money(day.ventas)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </ReportTable>

                        <ReportTable
                            title="Pedidos por estado"
                            description="Resumen de estados en el rango."
                            icon={ShoppingBag}
                        >
                            {report.pedidos_por_estado.length === 0 ? (
                                <EmptyText text="No hay pedidos registrados." />
                            ) : (
                                <div className="space-y-3">
                                    {report.pedidos_por_estado.map((item) => (
                                        <div
                                            key={item.estado}
                                            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                                        >
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[item.estado] ||
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                            >
                                                {item.estado}
                                            </span>

                                            <div className="text-right">
                                                <p className="font-bold">{item.cantidad} pedidos</p>
                                                <p className="text-sm text-slate-500">{money(item.total)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ReportTable>

                        <ReportTable
                            title="Productos más vendidos"
                            description="Top 10 productos por cantidad vendida."
                            icon={Package}
                        >
                            {report.productos_mas_vendidos.length === 0 ? (
                                <EmptyText text="No hay productos vendidos." />
                            ) : (
                                <div className="space-y-3">
                                    {report.productos_mas_vendidos.map((product, index) => (
                                        <div
                                            key={product.id_producto}
                                            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                                        >
                                            <div>
                                                <p className="font-bold">
                                                    #{index + 1} {product.nombre_producto}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Cantidad: {product.cantidad_vendida}
                                                </p>
                                            </div>

                                            <p className="font-bold">{money(product.total_vendido)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ReportTable>

                        <ReportTable
                            title="Tiendas con más ventas"
                            description="Top 10 tiendas por monto vendido."
                            icon={Store}
                        >
                            {report.tiendas_mas_vendidas.length === 0 ? (
                                <EmptyText text="No hay tiendas con ventas." />
                            ) : (
                                <div className="space-y-3">
                                    {report.tiendas_mas_vendidas.map((store, index) => (
                                        <div
                                            key={store.id_tienda}
                                            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                                    {store.logo_url ? (
                                                        <img
                                                            src={assetUrl(store.logo_url)}
                                                            alt={store.nombre_tienda}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Store className="h-6 w-6 text-slate-400" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-bold">
                                                        #{index + 1} {store.nombre_tienda}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {store.total_pedidos} pedidos
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="font-bold">{money(store.total_vendido)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ReportTable>
                    </div>
                </>
            )}
        </section>
    );
}

interface ReportCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: ElementType;
    tone: 'yellow' | 'green' | 'red' | 'blue' | 'slate';
}

const reportCardTones: Record<
    ReportCardProps['tone'],
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
    blue: {
        icon: 'bg-blue-50 text-blue-700',
        value: 'text-blue-700'
    },
    slate: {
        icon: 'bg-slate-100 text-slate-700',
        value: 'text-slate-900'
    }
};

function ReportCard({
    title,
    value,
    description,
    icon: Icon,
    tone
}: ReportCardProps) {
    const styles = reportCardTones[tone];

    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className={`mt-2 text-2xl font-bold ${styles.value}`}>{value}</p>
                </div>

                <div className={`rounded-2xl p-3 ${styles.icon}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">{description}</p>
        </article>
    );
}

interface ReportTableProps {
    title: string;
    description: string;
    icon: ElementType;
    children: React.ReactNode;
}

function ReportTable({
    title,
    description,
    icon: Icon,
    children
}: ReportTableProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
            </div>

            {children}
        </div>
    );
}

function EmptyText({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-600">
            {text}
        </div>
    );
}