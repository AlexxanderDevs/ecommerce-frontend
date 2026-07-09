import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, Search, Store } from 'lucide-react';
import { getPublicProductsByStoreSlug } from '../../api/product.api';
import type { Product } from '../../types/product.types';
import { assetUrl } from '../../utils/assets';

export function StoreProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadProducts(slug);
    }
  }, [slug]);

  async function loadProducts(storeSlug: string) {
    try {
      setLoading(true);
      const data = await getPublicProductsByStoreSlug(storeSlug);
      setProducts(data);
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

  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(search.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold">
                {storeInfo?.nombre_tienda || slug}
              </h1>
              <p className="text-slate-500">/{slug}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
            placeholder="Buscar producto..."
          />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-bold">No hay productos disponibles</h2>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id_producto}
                to={`/products/${product.id_producto}`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
                    <p className="text-lg font-bold">
                      ${Number(product.precio).toFixed(2)}
                    </p>

                    <span className="text-xs text-slate-500">
                      Stock: {product.stock_disponible ?? product.stock_general}
                    </span>
                  </div>

                  {product.requiere_variantes && (
                    <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
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