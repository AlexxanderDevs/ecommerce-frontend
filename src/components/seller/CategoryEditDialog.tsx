import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Layers3, Loader2, X } from 'lucide-react';

import type { Category } from '../../types/product.types';
import type { UpdateCategoryPayload } from '../../api/product.api';

interface CategoryEditDialogProps {
  open: boolean;
  category: Category | null;
  categories: Category[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateCategoryPayload) => void;
}

export function CategoryEditDialog({
  open,
  category,
  categories,
  loading,
  onClose,
  onSubmit
}: CategoryEditDialogProps) {
  const [categoryParent, setCategoryParent] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    if (!category) return;

    setCategoryParent(category.id_categoria_padre ?? '');
    setCategoryName(category.nombre ?? '');
    setCategoryDescription(category.descripcion ?? '');
  }, [category]);

  if (!open || !category) return null;

  const activeCategories = categories.filter((item) => {
    return item.estado === 'ACTIVO' && item.id_categoria !== category.id_categoria;
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    onSubmit({
      id_categoria_padre: categoryParent || null,
      nombre: categoryName,
      descripcion: categoryDescription || null
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Layers3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Editar categoría</h2>
              <p className="text-sm text-slate-600">
                Modifica el nombre, descripción o categoría padre.
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Categoría padre</label>
            <select
              value={categoryParent}
              onChange={(e) => setCategoryParent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="">Sin categoría padre</option>

              {activeCategories.map((item) => (
                <option key={item.id_categoria} value={item.id_categoria}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Ropa"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Productos relacionados con ropa..."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
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