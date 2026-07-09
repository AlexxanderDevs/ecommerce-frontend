import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    ImagePlus,
    Loader2,
    Plus,
    RefreshCcw,
    Store
} from 'lucide-react';
import { createStore, getMyStores } from '../../api/store.api';
import {
    uploadStoreCover,
    uploadStoreLabel,
    uploadStoreLogo
} from '../../api/upload.api';
import type { Store as StoreType } from '../../types/store.types';
import { assetUrl } from '../../utils/assets';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

type StoreStatus = NonNullable<StoreType['estado']>;

const statusStyles: Record<StoreStatus, string> = {
    PENDIENTE_REVISION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACTIVA: 'bg-green-50 text-green-700 border-green-200',
    INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
    SUSPENDIDA: 'bg-orange-50 text-orange-700 border-orange-200',
    RECHAZADA: 'bg-red-50 text-red-700 border-red-200',
    ELIMINADA: 'bg-zinc-50 text-zinc-700 border-zinc-200'
};

export function SellerDashboardPage() {
    const [stores, setStores] = useState<StoreType[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [colorPrincipal, setColorPrincipal] = useState('#111827');
    const [whatsapp, setWhatsapp] = useState('');
    const [correoContacto, setCorreoContacto] = useState('');
    const [direccion, setDireccion] = useState('');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [labelFile, setLabelFile] = useState<File | null>(null);

    useEffect(() => {
        loadStores();
    }, []);

    async function loadStores() {
        try {
            setLoadingStores(true);
            const data = await getMyStores();
            setStores(data);
        } catch (error){
            const message = getErrorMessage(error,'No se pudieron cargar tus tiendas.' );
            toast.error(message);
        } finally {
            setLoadingStores(false);
        }
    }

    function handleFileChange(
        event: ChangeEvent<HTMLInputElement>,
        setter: (file: File | null) => void
    ) {
        const file = event.target.files?.[0] ?? null;
        setter(file);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError('');
            setMessage('');

            let logoUrl: string | undefined;
            let portadaUrl: string | undefined;
            let etiquetaUrl: string | undefined;

            if (logoFile) {
                logoUrl = await uploadStoreLogo(logoFile);
            }

            if (coverFile) {
                portadaUrl = await uploadStoreCover(coverFile);
            }

            if (labelFile) {
                etiquetaUrl = await uploadStoreLabel(labelFile);
            }

            const response = await createStore({
                nombre,
                descripcion,
                logo_url: logoUrl,
                portada_url: portadaUrl,
                etiqueta_url: etiquetaUrl,
                color_principal: colorPrincipal,
                whatsapp,
                correo_contacto: correoContacto || undefined,
                direccion: direccion || undefined
            });

            setMessage(response.message);
            toast.success(response.message);

            setNombre('');
            setDescripcion('');
            setColorPrincipal('#111827');
            setWhatsapp('');
            setCorreoContacto('');
            setDireccion('');
            setLogoFile(null);
            setCoverFile(null);
            setLabelFile(null);

            await loadStores();
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudo crear la solicitud de tienda. Revisa los datos.'
            );
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Panel del vendedor</h1>
                    <p className="mt-2 text-slate-600">
                        Solicita una tienda, personaliza su imagen y espera la aprobación del administrador.
                    </p>
                </div>

                <button
                    onClick={loadStores}
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

            <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-900 p-3 text-white">
                            <Plus className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Crear solicitud de tienda</h2>
                            <p className="text-sm text-slate-600">
                                La tienda quedará pendiente de revisión.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nombre de la tienda</label>
                            <input
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Moda Kevin"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Tienda de ropa, perfumes y accesorios..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">WhatsApp de la tienda</label>
                            <input
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="593999999999"
                                required
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Usa formato internacional, por ejemplo: 593999999999.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Correo de contacto</label>
                            <input
                                value={correoContacto}
                                onChange={(e) => setCorreoContacto(e.target.value)}
                                type="email"
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="tienda@correo.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Dirección</label>
                            <input
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Quevedo, Ecuador"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Color principal</label>
                            <div className="mt-1 flex gap-3">
                                <input
                                    value={colorPrincipal}
                                    onChange={(e) => setColorPrincipal(e.target.value)}
                                    type="color"
                                    className="h-12 w-16 rounded-xl border border-slate-300 p-1"
                                />

                                <input
                                    value={colorPrincipal}
                                    onChange={(e) => setColorPrincipal(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="#111827"
                                />
                            </div>
                        </div>

                        <ImageInput
                            label="Logo de la tienda"
                            file={logoFile}
                            onChange={(event) => handleFileChange(event, setLogoFile)}
                        />

                        <ImageInput
                            label="Portada o banner"
                            file={coverFile}
                            onChange={(event) => handleFileChange(event, setCoverFile)}
                        />

                        <ImageInput
                            label="Etiqueta o sello para factura"
                            file={labelFile}
                            onChange={(event) => handleFileChange(event, setLabelFile)}
                        />

                        <button
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? 'Enviando solicitud...' : 'Solicitar tienda'}
                        </button>
                    </div>
                </form>

                <div>
                    <h2 className="mb-4 text-xl font-bold">Mis tiendas</h2>

                    {loadingStores ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                            Cargando tiendas...
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                            <Store className="mx-auto h-10 w-10 text-slate-400" />
                            <h3 className="mt-3 font-semibold">Aún no tienes tiendas</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Crea tu primera solicitud para que el administrador la revise.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {stores.map((store) => (
                                <StoreCard key={store.id_tienda} store={store} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

interface ImageInputProps {
    label: string;
    file: File | null;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function ImageInput({ label, file, onChange }: ImageInputProps) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <label className="mt-1 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600 hover:bg-slate-50">
                <ImagePlus className="h-5 w-5" />
                <span>{file ? file.name : 'Seleccionar imagen'}</span>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onChange}
                    className="hidden"
                />
            </label>
        </div>
    );
}

interface StoreCardProps {
    store: StoreType;
}

function StoreCard({ store }: StoreCardProps) {
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
                    style={{ backgroundColor: store.color_principal }}
                />
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {store.logo_url ? (
                            <img
                                src={assetUrl(store.logo_url)}
                                alt={store.nombre}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Store className="h-7 w-7 text-slate-400" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold">{store.nombre}</h3>
                        <p className="text-sm text-slate-500">/{store.slug}</p>

                        <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[store.estado ?? 'INACTIVA']
                                }`}
                        >
                            {store.estado ?? 'SIN_ESTADO'}
                        </span>
                    </div>
                </div>

                {store.descripcion && (
                    <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                        {store.descripcion}
                    </p>
                )}

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>
                        <strong>WhatsApp:</strong> {store.whatsapp}
                    </p>

                    {store.correo_contacto && (
                        <p>
                            <strong>Correo:</strong> {store.correo_contacto}
                        </p>
                    )}

                    {store.direccion && (
                        <p>
                            <strong>Dirección:</strong> {store.direccion}
                        </p>
                    )}
                </div>

                {store.estado === 'PENDIENTE_REVISION' && (
                    <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                        Tu tienda está pendiente. El administrador debe aprobarla para que aparezca públicamente.
                    </div>
                )}

                {store.estado === 'ACTIVA' && (
                    <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                        Tu tienda está activa. Ya puedes crear productos para vender.
                    </div>
                )}

                {store.estado === 'RECHAZADA' && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        Tu tienda fue rechazada. Revisa la información y solicita una nueva.
                    </div>
                )}
            </div>
        </article>
    );
}