import { useState, type FormEvent } from 'react';
import {
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Package,
    Search,
    ShoppingBag,
    Store,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { trackPublicOrder } from '../../api/track-order.api';
import type {
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

function money(value: string | number) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString();
}

export function TrackOrderPage() {
    const [code, setCode] = useState('');
    const [phone, setPhone] = useState('');
    const [data, setData] = useState<CustomerOrderDetail | null>(null);

    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!code.trim()) {
            toast.error('Código de seguimiento o factura');
            return;
        }

        if (!phone.trim()) {
            toast.error('Ingresa el teléfono usado en la compra.');
            return;
        }

        try {
            setLoading(true);
            setData(null);

            const response = await trackPublicOrder({
                code: code.trim(),
                phone: phone.trim()
            });

            setData(response);
            toast.success('Pedido encontrado correctamente.');
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudo consultar el pedido con los datos ingresados.'
            );

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mx-auto max-w-6xl px-4 py-12">
            <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
                    <Search className="h-8 w-8" />
                </div>

                <h1 className="mt-5 text-4xl font-bold">
                    Consultar pedido
                </h1>

                <p className="mt-3 text-slate-600">
                    Ingresa el código de seguimiento o factura junto con el teléfono usado al comprar.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">
                            Número de pedido o factura
                        </label>

                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                            placeholder="Ejemplo: TRK-202607-000001 o FAC-000001"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Teléfono usado en la compra
                        </label>

                        <input
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                            placeholder="Ejemplo: 0999999999"
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                    {loading ? 'Consultando...' : 'Consultar pedido'}
                </button>
            </form>

            {data && <TrackedOrderResult data={data} />}
        </section>
    );
}

function TrackedOrderResult({ data }: { data: CustomerOrderDetail }) {
    const { pedido, detalles, estados, factura } = data;
    const color = pedido.color_principal || '#111827';
    const StatusIcon = statusIcons[pedido.estado] || Clock;

    return (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                        {pedido.logo_url ? (
                            <img
                                src={assetUrl(pedido.logo_url)}
                                alt={pedido.nombre_tienda}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Store className="h-7 w-7 text-slate-400" />
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">Tienda</p>
                        <h2 className="text-2xl font-bold">{pedido.nombre_tienda}</h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Pedido realizado el {formatDate(pedido.fecha_creacion)}
                        </p>
                        {pedido.codigo_seguimiento && (
                            <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                Código: {pedido.codigo_seguimiento}
                            </p>
                        )}
                    </div>
                </div>

                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${statusStyles[pedido.estado]
                        }`}
                >
                    <StatusIcon className="h-4 w-4" />
                    {pedido.estado}
                </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                    <div className="rounded-3xl border border-slate-200 p-5">
                        <h3 className="font-bold">Productos del pedido</h3>

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
                                            {item.estado_anterior || 'Inicio'} → {item.estado_nuevo}
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
                    <Link
                        to={`/stores/${pedido.slug_tienda}`}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 font-medium"
                        style={{
                            borderColor: color,
                            color
                        }}
                    >
                        Ver tienda
                    </Link>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
                        <p className="font-semibold">Contacto de la tienda</p>
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
                                <p className="mt-1">Número: {factura.numero_factura}</p>
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
    );
}