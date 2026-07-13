import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    ImagePlus,
    Loader2,
    Save,
    Store,
    X
} from 'lucide-react';
import { toast } from 'sonner';

import type { Store as StoreType } from '../../types/store.types';
import { updateSellerStore } from '../../api/store.api';
import {
    uploadStoreCover,
    uploadStoreLabel,
    uploadStoreLogo
} from '../../api/upload.api';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface StoreEditDialogProps {
    open: boolean;
    store: StoreType | null;
    onClose: () => void;
    onUpdated: () => Promise<void> | void;
}

export function StoreEditDialog({
    open,
    store,
    onClose,
    onUpdated
}: StoreEditDialogProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [colorPrincipal, setColorPrincipal] = useState('#111827');
    const [whatsapp, setWhatsapp] = useState('');
    const [correoContacto, setCorreoContacto] = useState('');
    const [direccion, setDireccion] = useState('');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [labelFile, setLabelFile] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !store) {
            return;
        }

        setNombre(store.nombre ?? '');
        setDescripcion(store.descripcion ?? '');
        setColorPrincipal(store.color_principal || '#111827');
        setWhatsapp(store.whatsapp ?? '');
        setCorreoContacto(store.correo_contacto ?? '');
        setDireccion(store.direccion ?? '');

        setLogoFile(null);
        setCoverFile(null);
        setLabelFile(null);
    }, [open, store]);

    if (!open || !store) {
        return null;
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

        if (!store) {
            return;
        }

        try {
            setSubmitting(true);

            let logoUrl = store.logo_url ?? null;
            let portadaUrl = store.portada_url ?? null;
            let etiquetaUrl = store.etiqueta_url ?? null;

            if (logoFile) {
                logoUrl = await uploadStoreLogo(logoFile);
            }

            if (coverFile) {
                portadaUrl = await uploadStoreCover(coverFile);
            }

            if (labelFile) {
                etiquetaUrl = await uploadStoreLabel(labelFile);
            }

            await updateSellerStore(store.id_tienda, {
                nombre,
                descripcion,
                logo_url: logoUrl,
                portada_url: portadaUrl,
                etiqueta_url: etiquetaUrl,
                color_principal: colorPrincipal,
                whatsapp,
                correo_contacto: correoContacto || null,
                direccion: direccion || null
            });

            toast.success('Tienda actualizada correctamente.');
            await onUpdated();
            onClose();
        } catch (error) {
            const message = getErrorMessage(
                error,
                'No se pudo actualizar la tienda.'
            );

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleClose() {
        if (submitting) {
            return;
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
            <form
                onSubmit={handleSubmit}
                className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-900 p-3 text-white">
                            <Store className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Editar tienda</h2>
                            <p className="text-sm text-slate-600">
                                Actualiza la información pública de tu tienda.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nombre de la tienda</label>
                            <input
                                value={nombre}
                                onChange={(event) => setNombre(event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Nombre de la tienda"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={(event) => setDescripcion(event.target.value)}
                                className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Descripción de la tienda..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">WhatsApp</label>
                            <input
                                value={whatsapp}
                                onChange={(event) => setWhatsapp(event.target.value)}
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
                                onChange={(event) => setCorreoContacto(event.target.value)}
                                type="email"
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="tienda@correo.com"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Dirección</label>
                            <input
                                value={direccion}
                                onChange={(event) => setDireccion(event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                placeholder="Quevedo, Ecuador"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Color principal</label>
                            <div className="mt-1 flex gap-3">
                                <input
                                    value={colorPrincipal}
                                    onChange={(event) => setColorPrincipal(event.target.value)}
                                    type="color"
                                    className="h-12 w-16 rounded-xl border border-slate-300 p-1"
                                />

                                <input
                                    value={colorPrincipal}
                                    onChange={(event) => setColorPrincipal(event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="#111827"
                                />
                            </div>
                        </div>

                        <ImageInput
                            label="Cambiar logo"
                            file={logoFile}
                            onChange={(event) => handleFileChange(event, setLogoFile)}
                        />

                        <ImageInput
                            label="Cambiar portada"
                            file={coverFile}
                            onChange={(event) => handleFileChange(event, setCoverFile)}
                        />

                        <ImageInput
                            label="Cambiar etiqueta o sello"
                            file={labelFile}
                            onChange={(event) => handleFileChange(event, setLabelFile)}
                        />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-bold">Vista actual</p>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {store.portada_url || coverFile ? (
                                <div
                                    className="h-28 w-full"
                                    style={{ backgroundColor: colorPrincipal }}
                                >
                                    <img
                                        src={coverFile ? URL.createObjectURL(coverFile) : assetUrl(store.portada_url)}
                                        alt={store.nombre}
                                        className="h-full w-full object-cover opacity-90"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="h-28 w-full"
                                    style={{ backgroundColor: colorPrincipal }}
                                />
                            )}
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                        {store.logo_url ? (
                                            <img
                                                src={assetUrl(store.logo_url)}
                                                alt={store.nombre}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Store className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-bold">{store.nombre}</p>
                                        <p className="truncate text-xs text-slate-500">
                                            /{store.slug}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    Las imágenes nuevas se aplicarán cuando guardes los cambios.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700">
                            El enlace público de la tienda no cambia porque depende del slug.
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}

                        {submitting ? 'Guardando cambios...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
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