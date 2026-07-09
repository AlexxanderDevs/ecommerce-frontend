import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { getPublicProductDetail } from '../../api/product.api';
import type { ProductVariant, PublicProductDetail } from '../../types/product.types';
import { assetUrl } from '../../utils/assets';
import { useCart } from '../../hooks/useCart';
import { toast } from 'sonner';

export function ProductDetailPage() {
    const { id } = useParams();

    const [data, setData] = useState<PublicProductDetail | null>(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    const { addItem } = useCart();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadProduct(id);
        }
    }, [id]);

    async function loadProduct(productId: string) {
        try {
            setLoading(true);

            const response = await getPublicProductDetail(productId);
            setData(response);

            const mainImage =
                response.imagenes.find((image) => image.es_principal)?.url_imagen ||
                response.imagenes[0]?.url_imagen ||
                '';

            setSelectedImage(mainImage);
        } finally {
            setLoading(false);
        }
    }

    function handleAddToCart() {
        if (!data) return;

        if (producto.requiere_variantes && !selectedVariant) {
            setError('Debes seleccionar una talla, color o variante.');
            return;
        }

        const result = addItem(
            {
                id_tienda: producto.id_tienda,
                nombre_tienda: producto.nombre_tienda,
                slug_tienda: producto.slug_tienda,
                whatsapp: producto.whatsapp
            },
            {
                id_producto: producto.id_producto,
                id_variante: selectedVariant?.id_variante ?? null,
                nombre: producto.nombre,
                imagen: selectedImage || null,
                talla: selectedVariant?.talla ?? null,
                color: selectedVariant?.color ?? null,
                precio_unitario: finalPrice,
                cantidad: quantity,
                requiere_variantes: producto.requiere_variantes
            }
        );

        if (!result.ok) {
            setError(result.message);
            setMessage('');
            toast.error(result.message);
            return;
        }

        setMessage(result.message);
        setError('');
        toast.success(result.message);
    }

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    Cargando producto...
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                    Producto no encontrado.
                </div>
            </section>
        );
    }

    const { producto, imagenes, variantes } = data;

    const finalPrice =
        Number(producto.precio) + Number(selectedVariant?.precio_adicional || 0);

    const stockAvailable = producto.requiere_variantes
        ? selectedVariant?.stock ?? 0
        : producto.stock_disponible ?? producto.stock_general;

    return (
        <section className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid gap-10 lg:grid-cols-2">
                <div>
                    <div className="flex h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        {selectedImage ? (
                            <img
                                src={assetUrl(selectedImage)}
                                alt={producto.nombre}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Package className="h-20 w-20 text-slate-400" />
                        )}
                    </div>

                    {imagenes.length > 1 && (
                        <div className="mt-4 grid grid-cols-5 gap-3">
                            {imagenes.map((image) => (
                                <button
                                    key={image.id_imagen}
                                    onClick={() => setSelectedImage(image.url_imagen)}
                                    className={`h-20 overflow-hidden rounded-2xl border bg-white ${selectedImage === image.url_imagen
                                        ? 'border-slate-900'
                                        : 'border-slate-200'
                                        }`}
                                >
                                    <img
                                        src={assetUrl(image.url_imagen)}
                                        alt={producto.nombre}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        {producto.nombre_tienda}
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">{producto.nombre}</h1>

                    <p className="mt-3 text-sm text-slate-500">
                        {producto.categoria || 'Sin categoría'}
                    </p>

                    <p className="mt-6 text-3xl font-bold">
                        ${finalPrice.toFixed(2)}
                    </p>

                    {producto.descripcion && (
                        <p className="mt-6 leading-7 text-slate-600">
                            {producto.descripcion}
                        </p>
                    )}

                    {producto.requiere_variantes && (
                        <div className="mt-8">
                            <h3 className="font-semibold">Selecciona una opción</h3>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {variantes.map((variant) => (
                                    <button
                                        key={variant.id_variante}
                                        onClick={() => setSelectedVariant(variant)}
                                        disabled={variant.stock <= 0}
                                        className={`rounded-2xl border p-4 text-left text-sm transition ${selectedVariant?.id_variante === variant.id_variante
                                            ? 'border-slate-900 bg-slate-50'
                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                        <p className="font-semibold">
                                            {variant.talla ? `Talla ${variant.talla}` : 'Sin talla'}
                                            {variant.color ? ` - ${variant.color}` : ''}
                                        </p>

                                        <p className="mt-1 text-slate-500">
                                            Stock: {variant.stock}
                                        </p>

                                        {Number(variant.precio_adicional) > 0 && (
                                            <p className="mt-1 text-slate-500">
                                                +${Number(variant.precio_adicional).toFixed(2)}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <label className="text-sm font-medium">Cantidad</label>
                        <input
                            value={quantity}
                            onChange={(e) => {
                                const value = Number(e.target.value);

                                if (Number.isNaN(value) || value < 1) {
                                    setQuantity(1);
                                    return;
                                }

                                if (stockAvailable > 0 && value > stockAvailable) {
                                    setQuantity(stockAvailable);
                                    return;
                                }

                                setQuantity(value);
                            }}
                            type="number"
                            min="1"
                            max={stockAvailable}
                            className="mt-2 w-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        Stock disponible: {stockAvailable}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={
                            stockAvailable <= 0 ||
                            (producto.requiere_variantes && !selectedVariant)
                        }
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        Agregar al carrito
                    </button>

                    {message && (
                        <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {producto.requiere_variantes && !selectedVariant && (
                        <p className="mt-3 text-sm text-red-600">
                            Debes seleccionar una talla, color o variante antes de agregar al carrito.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}