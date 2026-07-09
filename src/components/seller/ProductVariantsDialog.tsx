import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    
    Edit3,
    Loader2,
    Package,
    Power,
    RotateCcw,
    Shirt,
    X
} from 'lucide-react';
import { toast } from 'sonner';

import type { Product, ProductVariant } from '../../types/product.types';
import type { UpdateVariantPayload } from '../../api/product.api';
import {
    activateSellerProductVariant,
    deactivateSellerProductVariant,
    getSellerProductVariants,
    updateSellerProductVariant
} from '../../api/product.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ProductVariantsDialogProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onChanged?: () => void;
}

export function ProductVariantsDialog({
    open,
    product,
    onClose,
    onChanged
}: ProductVariantsDialogProps) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

    const [sku, setSku] = useState('');
    const [talla, setTalla] = useState('');
    const [color, setColor] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [stock, setStock] = useState('');
    const [precioAdicional, setPrecioAdicional] = useState('0');

    const [confirmAction, setConfirmAction] = useState<{
        open: boolean;
        type: 'activate' | 'deactivate';
        variant: ProductVariant | null;
    }>({
        open: false,
        type: 'deactivate',
        variant: null
    });

    useEffect(() => {
        const productId = product?.id_producto;

        if (open && productId) {
            loadVariants(productId);
        }
    }, [open, product?.id_producto]);

    useEffect(() => {
        if (!editingVariant) return;

        setSku(editingVariant.sku ?? '');
        setTalla(editingVariant.talla ?? '');
        setColor(editingVariant.color ?? '');
        setDescripcion(editingVariant.descripcion_variante ?? '');
        setStock(String(editingVariant.stock ?? 0));
        setPrecioAdicional(String(editingVariant.precio_adicional ?? 0));
    }, [editingVariant]);

    if (!open || !product) return null;
    const currentProduct = product;

    async function loadVariants(productId: string) {
        try {
            setLoading(true);

            const data = await getSellerProductVariants(productId);
            setVariants(data);
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudieron cargar las variantes.');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (loading || actionLoading) return;

        setEditingVariant(null);
        onClose();
    }

    function openEditVariant(variant: ProductVariant) {
        setEditingVariant(variant);
    }

    function closeEditVariant() {
        if (actionLoading) return;
        setEditingVariant(null);
    }

    async function handleUpdateVariant(event: FormEvent) {
        event.preventDefault();

        if (!editingVariant) return;

        const payload: UpdateVariantPayload = {
            sku: sku || null,
            talla: talla || null,
            color: color || null,
            descripcion_variante: descripcion || null,
            stock: Number(stock || 0),
            precio_adicional: Number(precioAdicional || 0)
        };

        try {
            setActionLoading(editingVariant.id_variante);

            await updateSellerProductVariant(editingVariant.id_variante, payload);

            toast.success('Variante actualizada correctamente.');

            await loadVariants(currentProduct.id_producto);
            onChanged?.();

            setEditingVariant(null);
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudo actualizar la variante.');
            toast.error(message);
        } finally {
            setActionLoading('');
        }
    }

    function openDeactivateDialog(variant: ProductVariant) {
        setConfirmAction({
            open: true,
            type: 'deactivate',
            variant
        });
    }

    function openActivateDialog(variant: ProductVariant) {
        setConfirmAction({
            open: true,
            type: 'activate',
            variant
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmAction({
            open: false,
            type: 'deactivate',
            variant: null
        });
    }

    async function handleConfirmVariantAction() {
        if (!confirmAction.variant) return;

        try {
            setActionLoading(confirmAction.variant.id_variante);

            if (confirmAction.type === 'deactivate') {
                await deactivateSellerProductVariant(confirmAction.variant.id_variante);
                toast.success('Variante desactivada correctamente.');
            } else {
                await activateSellerProductVariant(confirmAction.variant.id_variante);
                toast.success('Variante reactivada correctamente.');
            }

            await loadVariants(currentProduct.id_producto);
            onChanged?.();

            setConfirmAction({
                open: false,
                type: 'deactivate',
                variant: null
            });
        } catch (error) {
            const message = getErrorMessage(
                error,
                confirmAction.type === 'deactivate'
                    ? 'No se pudo desactivar la variante.'
                    : 'No se pudo reactivar la variante.'
            );

            toast.error(message);
        } finally {
            setActionLoading('');
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
                <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                <Shirt className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">Variantes del producto</h2>
                                <p className="text-sm text-slate-600">
                                    Producto: <strong>{currentProduct.nombre}</strong>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading || !!actionLoading}
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="mt-8 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                            <p className="mt-2">Cargando variantes...</p>
                        </div>
                    ) : variants.length === 0 ? (
                        <div className="mt-8 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
                            <Package className="mx-auto h-10 w-10 text-slate-400" />
                            <p className="mt-3 font-medium">Este producto aún no tiene variantes.</p>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4">
                            {variants.map((variant) => {
                                const isInactive =
                                    variant.estado === 'INACTIVO' || variant.estado === 'ELIMINADO';

                                return (
                                    <article
                                        key={variant.id_variante}
                                        className={`rounded-2xl border p-4 ${isInactive
                                                ? 'border-red-200 bg-red-50/40 opacity-80'
                                                : 'border-slate-200 bg-white'
                                            }`}
                                    >
                                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold">
                                                        {variant.talla ? `Talla ${variant.talla}` : 'Sin talla'}
                                                        {variant.color ? ` - ${variant.color}` : ''}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${isInactive
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-50 text-green-700'
                                                            }`}
                                                    >
                                                        {variant.estado}
                                                    </span>
                                                </div>

                                                <div className="mt-2 grid gap-1 text-sm text-slate-600 md:grid-cols-4">
                                                    <p>
                                                        <strong>SKU:</strong> {variant.sku || 'Sin SKU'}
                                                    </p>
                                                    <p>
                                                        <strong>Stock:</strong> {variant.stock}
                                                    </p>
                                                    <p>
                                                        <strong>Adicional:</strong> $
                                                        {Number(variant.precio_adicional).toFixed(2)}
                                                    </p>
                                                    <p>
                                                        <strong>Color:</strong> {variant.color || 'N/A'}
                                                    </p>
                                                </div>

                                                {variant.descripcion_variante && (
                                                    <p className="mt-2 text-sm text-slate-500">
                                                        {variant.descripcion_variante}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditVariant(variant)}
                                                    disabled={!!actionLoading}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    Editar
                                                </button>

                                                {isInactive ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openActivateDialog(variant)}
                                                        disabled={!!actionLoading}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-60"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Reactivar
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeactivateDialog(variant)}
                                                        disabled={!!actionLoading}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        <Power className="h-4 w-4" />
                                                        Desactivar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {editingVariant && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">Editar variante</h2>
                                <p className="text-sm text-slate-600">
                                    Actualiza talla, color, stock o precio adicional.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditVariant}
                                disabled={!!actionLoading}
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateVariant} className="mt-6 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Talla</label>
                                <input
                                    value={talla}
                                    onChange={(e) => setTalla(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="M, L, 40..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Color</label>
                                <input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="Negro"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">SKU</label>
                                <input
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="CAM-001-M-NEGRO"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Stock</label>
                                <input
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    type="number"
                                    min="0"
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Precio adicional</label>
                                <input
                                    value={precioAdicional}
                                    onChange={(e) => setPrecioAdicional(e.target.value)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <input
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                                    placeholder="Talla M color negro"
                                />
                            </div>

                            <div className="mt-4 flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
                                <button
                                    type="button"
                                    onClick={closeEditVariant}
                                    disabled={!!actionLoading}
                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                    Cancelar
                                </button>

                                <button
                                    disabled={!!actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                >
                                    {actionLoading === editingVariant.id_variante && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmAction.open}
                title={
                    confirmAction.type === 'deactivate'
                        ? '¿Desactivar variante?'
                        : '¿Reactivar variante?'
                }
                description={
                    confirmAction.type === 'deactivate'
                        ? `La variante seleccionada dejará de estar disponible para los clientes.`
                        : `La variante seleccionada volverá a estar disponible para los clientes.`
                }
                confirmText={
                    confirmAction.type === 'deactivate'
                        ? 'Sí, desactivar'
                        : 'Sí, reactivar'
                }
                variant={confirmAction.type === 'deactivate' ? 'danger' : 'success'}
                loading={
                    !!confirmAction.variant &&
                    actionLoading === confirmAction.variant.id_variante
                }
                onConfirm={handleConfirmVariantAction}
                onClose={closeConfirmDialog}
            />
        </>
    );
}