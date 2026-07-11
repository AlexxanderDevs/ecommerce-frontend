import { useEffect, useState } from 'react';
import {
  ImageIcon,
  Loader2,
  Star,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import type { Product, ProductImage } from '../../types/product.types';
import {
  addProductImage,
  deactivateSellerProductImage,
  getSellerProductImages,
  setMainSellerProductImage
} from '../../api/product.api';
import { uploadProductImage } from '../../api/upload.api';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ProductImagesDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onChanged?: () => void;
}

export function ProductImagesDialog({
  open,
  product,
  onClose,
  onChanged
}: ProductImagesDialogProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [uploading, setUploading] = useState(false);

  const [confirmImage, setConfirmImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    const productId = product?.id_producto;

    if (open && productId) {
      loadImages(productId);
    }
  }, [open, product?.id_producto]);

  if (!open || !product) return null;

  const currentProduct = product;

  async function loadImages(productId: string) {
    try {
      setLoading(true);

      const data = await getSellerProductImages(productId);
      setImages(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar las imágenes.'
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading || actionLoading || uploading) return;
    onClose();
  }

  async function handleUploadImage(file: File | null) {
    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await uploadProductImage(file);

      await addProductImage(currentProduct.id_producto, {
        url_imagen: imageUrl,
        es_principal: images.length === 0,
        orden: images.length + 1
      });

      toast.success('Imagen agregada correctamente.');

      await loadImages(currentProduct.id_producto);
      onChanged?.();
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo agregar la imagen.'
      );

      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSetMainImage(image: ProductImage) {
    if (image.es_principal) return;

    if (image.estado && image.estado !== 'ACTIVO') {
      toast.error('No puedes marcar como principal una imagen inactiva.');
      return;
    }

    try {
      setActionLoading(image.id_imagen);

      await setMainSellerProductImage(image.id_imagen);

      toast.success('Imagen principal actualizada correctamente.');

      await loadImages(currentProduct.id_producto);
      onChanged?.();
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo marcar la imagen como principal.'
      );

      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  function openDeactivateDialog(image: ProductImage) {
    setConfirmImage(image);
  }

  function closeDeactivateDialog() {
    if (actionLoading) return;
    setConfirmImage(null);
  }

  async function handleDeactivateImage() {
    if (!confirmImage) return;

    try {
      setActionLoading(confirmImage.id_imagen);

      await deactivateSellerProductImage(confirmImage.id_imagen);

      toast.success('Imagen desactivada correctamente.');

      await loadImages(currentProduct.id_producto);
      onChanged?.();

      setConfirmImage(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo desactivar la imagen.'
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
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Imágenes del producto</h2>
                <p className="text-sm text-slate-600">
                  Producto: <strong>{currentProduct.nombre}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading || uploading || !!actionLoading}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Agregar nueva imagen

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading || !!actionLoading}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  handleUploadImage(file);
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          {loading ? (
            <div className="mt-8 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-2">Cargando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 font-medium">
                Este producto aún no tiene imágenes.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => {
                const isInactive =
                  image.estado === 'INACTIVO' || image.estado === 'ELIMINADO';

                return (
                  <article
                    key={image.id_imagen}
                    className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                      isInactive
                        ? 'border-red-200 opacity-70'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="relative h-52 bg-slate-100">
                      <img
                        src={assetUrl(image.url_imagen)}
                        alt={currentProduct.nombre}
                        className="h-full w-full object-cover"
                      />

                      {image.es_principal && (
                        <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                          Principal
                        </span>
                      )}

                      {isInactive && (
                        <span className="absolute right-3 top-3 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Inactiva
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      <p className="text-sm text-slate-600">
                        Orden: {image.orden} · Estado: {image.estado || 'ACTIVO'}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(image)}
                          disabled={
                            image.es_principal ||
                            isInactive ||
                            actionLoading === image.id_imagen
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                        >
                          {actionLoading === image.id_imagen ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                          Principal
                        </button>

                        {!isInactive && (
                          <button
                            type="button"
                            onClick={() => openDeactivateDialog(image)}
                            disabled={actionLoading === image.id_imagen}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {actionLoading === image.id_imagen ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

      <ConfirmDialog
        open={!!confirmImage}
        title="¿Desactivar imagen?"
        description={
          confirmImage?.es_principal
            ? 'Esta imagen es la principal. Al desactivarla, el sistema intentará colocar otra imagen activa como principal.'
            : 'La imagen dejará de aparecer en el producto.'
        }
        confirmText="Sí, desactivar"
        variant="danger"
        loading={
          !!confirmImage && actionLoading === confirmImage.id_imagen
        }
        onConfirm={handleDeactivateImage}
        onClose={closeDeactivateDialog}
      />
    </>
  );
}