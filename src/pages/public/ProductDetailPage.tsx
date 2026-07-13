import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Package,
  ShoppingBag,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

import { getPublicProductDetail } from '../../api/product.api';
import type {
  ProductVariant,
  PublicProductDetail
} from '../../types/product.types';
import { assetUrl } from '../../utils/assets';
import { useCart } from '../../hooks/useCart';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function ProductDetailPage() {
  const { id } = useParams();

  const [data, setData] = useState<PublicProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { addItem } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  async function loadProduct(productId: string) {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await getPublicProductDetail(productId);
      setData(response);

      const mainImage =
        response.imagenes.find((image) => image.es_principal)?.url_imagen ||
        response.imagenes[0]?.url_imagen ||
        response.producto.imagen_principal ||
        '';

      setSelectedImage(mainImage);
      setSelectedVariant(null);
      setQuantity(1);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo cargar el detalle del producto.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const producto = data?.producto;
  const imagenes = data?.imagenes ?? [];
  const variantes = data?.variantes ?? [];

  const finalPrice =
    Number(producto?.precio ?? 0) +
    Number(selectedVariant?.precio_adicional || 0);

  const stockAvailable = producto?.requiere_variantes
    ? selectedVariant?.stock ?? 0
    : producto?.stock_disponible ?? producto?.stock_general ?? 0;

  const isOutOfStock = stockAvailable <= 0;
  const storeColor = producto?.color_principal || '#111827';

  function handleQuantityChange(value: number) {
    if (Number.isNaN(value) || value < 1) {
      setQuantity(1);
      return;
    }

    if (stockAvailable > 0 && value > stockAvailable) {
      setQuantity(stockAvailable);
      return;
    }

    setQuantity(value);
  }

  function decreaseQuantity() {
    if (quantity <= 1) return;
    setQuantity((current) => current - 1);
  }

  function increaseQuantity() {
    if (quantity >= stockAvailable) return;
    setQuantity((current) => current + 1);
  }

  function handleAddToCart() {
    if (!producto) return;

    setMessage('');
    setError('');

    if (producto.requiere_variantes && !selectedVariant) {
      const message = 'Debes seleccionar una talla, color o variante.';
      setError(message);
      toast.error(message);
      return;
    }

    if (isOutOfStock) {
      const message = 'Este producto no tiene stock disponible.';
      setError(message);
      toast.error(message);
      return;
    }

    const result = addItem(
      {
        id_tienda: producto.id_tienda,
        nombre_tienda: producto.nombre_tienda,
        slug_tienda: producto.slug_tienda,
        whatsapp: producto.whatsapp,
        color_principal: producto.color_principal
      },
      {
        id_producto: producto.id_producto,
        id_variante: selectedVariant?.id_variante ?? null,
        nombre: producto.nombre,
        imagen: selectedImage || producto.imagen_principal || null,
        talla: selectedVariant?.talla ?? null,
        color: selectedVariant?.color ?? null,
        precio_unitario: finalPrice,
        cantidad: quantity,
        requiere_variantes: producto.requiere_variantes,
        stock_disponible: stockAvailable
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
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3">Cargando producto...</p>
        </div>
      </section>
    );
  }

  if (!producto) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">Producto no encontrado</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <Link
        to={`/stores/${producto.slug_tienda}`}
        className="font-bold hover:underline"
        style={{ color: storeColor }}
      >
        {producto.nombre_tienda}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {imagenes.map((image) => (
                <button
                  key={image.id_imagen}
                  type="button"
                  onClick={() => setSelectedImage(image.url_imagen)}
                  className="h-24 overflow-hidden rounded-2xl border bg-white transition"
                  style={
                    selectedImage === image.url_imagen
                      ? {
                        borderColor: storeColor,
                        boxShadow: `0 0 0 2px ${storeColor}`
                      }
                      : {
                        borderColor: '#e2e8f0'
                      }
                  }
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
          <div className="flex items-center gap-3">
            {producto.logo_url ? (
              <img
                src={assetUrl(producto.logo_url)}
                alt={producto.nombre_tienda}
                className="h-12 w-12 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Store className="h-6 w-6 text-slate-400" />
              </div>
            )}

            <div>
              <p className="text-sm text-slate-500">Tienda</p>
              <Link
                to={`/stores/${producto.slug_tienda}`}
                className="font-bold hover:underline"
              >
                {producto.nombre_tienda}
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">
              {producto.categoria || 'Sin categoría'}
            </p>

            <h1
              className="mt-2 text-4xl font-bold"
              style={{ color: storeColor }}
            >
              {producto.nombre}
            </h1>
            {producto.destacado && (
              <span className="mt-3 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                Producto destacado
              </span>
            )}

            <p
              className="mt-6 text-3xl font-bold"
              style={{ color: storeColor }}
            >
              ${finalPrice.toFixed(2)}
            </p>
            {selectedVariant &&
              Number(selectedVariant.precio_adicional || 0) > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  Incluye adicional de variante: $
                  {Number(selectedVariant.precio_adicional).toFixed(2)}
                </p>
              )}

            <div
              className={`mt-4 rounded-xl p-4 text-sm font-medium ${isOutOfStock
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
                }`}
            >
              {producto.requiere_variantes && !selectedVariant
                ? 'Selecciona una variante para ver el stock.'
                : isOutOfStock
                  ? 'Producto agotado.'
                  : `Stock disponible: ${stockAvailable}`}
            </div>
          </div>

          {producto.descripcion && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="font-bold">Descripción</h2>
              <p className="mt-2 leading-7 text-slate-600">
                {producto.descripcion}
              </p>
            </div>
          )}

          {producto.requiere_variantes && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="font-semibold">Selecciona una opción</h3>

              {variantes.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Este producto no tiene variantes disponibles.
                </div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {variantes.map((variant) => {
                    const isSelected =
                      selectedVariant?.id_variante === variant.id_variante;
                    const variantOutOfStock = variant.stock <= 0;

                    return (
                      <button
                        key={variant.id_variante}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQuantity(1);
                          setMessage('');
                          setError('');
                        }}
                        disabled={variantOutOfStock}
                        className="rounded-2xl border p-4 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                        style={
                          isSelected
                            ? {
                              borderColor: storeColor,
                              backgroundColor: storeColor,
                              color: '#ffffff'
                            }
                            : {
                              borderColor: '#e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#0f172a'
                            }
                        }
                      >
                        <p className="font-semibold">
                          {variant.talla
                            ? `Talla ${variant.talla}`
                            : 'Sin talla'}
                          {variant.color ? ` - ${variant.color}` : ''}
                        </p>

                        <p className="mt-1 opacity-80">
                          {variantOutOfStock
                            ? 'Sin stock'
                            : `Stock: ${variant.stock}`}
                        </p>

                        {Number(variant.precio_adicional) > 0 && (
                          <p className="mt-1 opacity-80">
                            +${Number(variant.precio_adicional).toFixed(2)}
                          </p>
                        )}

                        {variant.descripcion_variante && (
                          <p className="mt-2 opacity-80">
                            {variant.descripcion_variante}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <label className="text-sm font-medium">Cantidad</label>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isOutOfStock}
                className="flex h-11 w-11 items-center justify-center rounded-xl border font-bold disabled:opacity-50"
                style={{ borderColor: storeColor, color: storeColor }}
              >
                -
              </button>

              <input
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                type="number"
                min="1"
                max={stockAvailable}
                disabled={isOutOfStock}
                className="h-11 w-24 rounded-xl border border-slate-300 px-4 text-center outline-none focus:border-slate-900 disabled:bg-slate-100"
              />

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= stockAvailable || isOutOfStock}
                className="flex h-11 w-11 items-center justify-center rounded-xl border font-bold disabled:opacity-50"
                style={{ borderColor: storeColor, color: storeColor }}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              isOutOfStock ||
              (producto.requiere_variantes && !selectedVariant) ||
              (producto.requiere_variantes && variantes.length === 0)
            }
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: storeColor }}
          >
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}
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
              Debes seleccionar una talla, color o variante antes de agregar al
              carrito.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}