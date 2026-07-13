import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, Search, Store } from 'lucide-react';

import {
  getPublicCategoriesByStoreSlug,
  getPublicProductsByStoreSlug
} from '../../api/product.api';

import type { Category, Product } from '../../types/product.types';
import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function StoreProductsPage() {
  const { slug } = useParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStoreData();
  }, [slug]);

  async function loadStoreData() {
    if (!slug) return;

    try {
      setLoading(true);
      setError('');

      const [productsData, categoriesData] = await Promise.all([
        getPublicProductsByStoreSlug(slug),
        getPublicCategoriesByStoreSlug(slug)
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar los productos de la tienda.'
      );

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const storeInfo = products[0] as Product & {
    nombre_tienda?: string;
    logo_url?: string | null;
    portada_url?: string | null;
    color_principal?: string;
  };
  const storeColor = storeInfo?.color_principal || '#111827';

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = selectedCategoryId
      ? product.id_categoria === selectedCategoryId
      : true;

    return matchesSearch && matchesCategory;
  });

  const selectedCategoryName =
    categories.find((category) => category.id_categoria === selectedCategoryId)
      ?.nombre || 'Todos';

  return (
    <section>
      <div className="bg-white">
        {storeInfo?.portada_url ? (
          <img
            src={assetUrl(storeInfo.portada_url)}
            alt={storeInfo.nombre_tienda}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div
            className="h-64 w-full"
            style={{ backgroundColor: storeInfo?.color_principal || '#111827' }}
          />
        )}

        <div className="mx-auto max-w-7xl px-4">
          <div className="-mt-12 flex items-end gap-4 pb-8">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow">
              {storeInfo?.logo_url ? (
                <img
                  src={assetUrl(storeInfo.logo_url)}
                  alt={storeInfo.nombre_tienda}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="h-10 w-10 text-slate-400" />
              )}
            </div>

            <div className="pb-2">
              <h1
                className="text-3xl font-bold"
                style={{ color: storeColor }}
              >
                {storeInfo?.nombre_tienda || slug}
              </h1>
              <p className="text-slate-500">/{slug}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
            placeholder="Buscar producto..."
          />
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold">Categorías</h2>
              <p className="text-sm text-slate-600">
                Filtra los productos disponibles en esta tienda.
              </p>
            </div>

            <span
              className="rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: storeColor }}
            >
              Mostrando: {selectedCategoryName}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('')}
              className="rounded-full border px-4 py-2 text-sm font-medium transition"
              style={
                selectedCategoryId === ''
                  ? {
                    borderColor: storeColor,
                    backgroundColor: storeColor,
                    color: '#ffffff'
                  }
                  : {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155'
                  }
              }
            >
              Todos
            </button>

            {categories.map((category) => (
              <button
                key={category.id_categoria}
                type="button"
                onClick={() => setSelectedCategoryId(category.id_categoria)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition"
                style={
                  selectedCategoryId === category.id_categoria
                    ? {
                      borderColor: storeColor,
                      backgroundColor: storeColor,
                      color: '#ffffff'
                    }
                    : {
                      borderColor: '#cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155'
                    }
                }
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-bold">
              No hay productos disponibles
            </h2>
            <p className="mt-2 text-slate-500">
              No se encontraron productos con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id_producto}
                to={`/products/${product.id_producto}`}
                className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex h-56 items-center justify-center bg-slate-100">
                  {product.imagen_principal ? (
                    <img
                      src={assetUrl(product.imagen_principal)}
                      alt={product.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-slate-400" />
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500">
                    {product.categoria || 'Sin categoría'}
                  </p>

                  <h2 className="mt-1 line-clamp-2 font-bold">
                    {product.nombre}
                  </h2>

                  <div className="mt-3 flex items-center justify-between">
                    <p
                      className="text-lg font-bold"
                     
                    >
                      ${Number(product.precio).toFixed(2)}
                    </p>

                    <span className="text-xs text-slate-500">
                      Stock:{' '}
                      {product.stock_disponible ?? product.stock_general}
                    </span>
                  </div>

                  {product.destacado && (
                    <div
                      className="mt-3 rounded-xl px-3 py-2 text-xs font-medium text-white"
                      style={{ backgroundColor: storeColor }}
                    >
                      Producto destacado
                    </div>
                  )}

                  {product.requiere_variantes && (
                    <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                      style={{ color: storeColor }}
                      >
                      Selecciona talla o color
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}