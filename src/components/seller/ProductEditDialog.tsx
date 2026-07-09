import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, Pencil, X } from 'lucide-react';

import type { Category, Product } from '../../types/product.types';
import type { UpdateProductPayload } from '../../api/product.api';

interface ProductEditDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateProductPayload) => void;
}

export function ProductEditDialog({
  open,
  product,
  categories,
  loading,
  onClose,
  onSubmit
}: ProductEditDialogProps) {
  const [productCategory, setProductCategory] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [requiresVariants, setRequiresVariants] = useState(false);
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (!product) return;

    setProductCategory(product.id_categoria ?? '');
    setProductCode(product.codigo_producto ?? '');
    setProductName(product.nombre ?? '');
    setProductDescription(product.descripcion ?? '');
    setProductPrice(String(product.precio ?? ''));
    setProductStock(String(product.stock_general ?? 0));
    setRequiresVariants(Boolean(product.requiere_variantes));
    setFeatured(Boolean(product.destacado));
  }, [product]);

  if (!open || !product) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    onSubmit({
      id_categoria: productCategory || null,
      codigo_producto: productCode || null,
      nombre: productName,
      descripcion: productDescription || null,
      precio: Number(productPrice),
      stock_general: requiresVariants ? 0 : Number(productStock || 0),
      requiere_variantes: requiresVariants,
      destacado: featured
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Pencil className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Editar producto</h2>
              <p className="text-sm text-slate-600">
                Modifica la información principal del producto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="">Sin categoría</option>

              {categories.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Código</label>
            <input
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="PROD-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Precio</label>
            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stock general</label>
            <input
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              type="number"
              min="0"
              disabled={requiresVariants}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              checked={requiresVariants}
              onChange={(e) => setRequiresVariants(e.target.checked)}
              type="checkbox"
              className="h-4 w-4"
            />

            <span className="text-sm">
              Este producto requiere variantes, tallas o colores
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              type="checkbox"
              className="h-4 w-4"
            />

            <span className="text-sm">Producto destacado</span>
          </label>

          <div className="mt-4 flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}