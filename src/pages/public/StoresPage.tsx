import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search } from 'lucide-react';
import { getPublicStores } from '../../api/store.api';
import type { Store as StoreType } from '../../types/store.types';
import { assetUrl } from '../../utils/assets';

export function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      setLoading(true);
      const data = await getPublicStores();
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter((store) =>
    store.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tiendas disponibles</h1>
        <p className="mt-2 text-slate-600">
          Explora tiendas aprobadas y revisa sus productos.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
          placeholder="Buscar tienda..."
        />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          Cargando tiendas...
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Store className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No hay tiendas disponibles</h2>
          <p className="mt-2 text-slate-600">
            Cuando el administrador apruebe tiendas, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Link
              key={store.id_tienda}
              to={`/stores/${store.slug}`}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {store.portada_url ? (
                <img
                  src={assetUrl(store.portada_url)}
                  alt={store.nombre}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div
                  className="h-40 w-full"
                  style={{ backgroundColor: store.color_principal }}
                />
              )}

              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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

                  <div>
                    <h2 className="text-lg font-bold">{store.nombre}</h2>
                    <p className="text-sm text-slate-500">/{store.slug}</p>
                  </div>
                </div>

                {store.descripcion && (
                  <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                    {store.descripcion}
                  </p>
                )}

                <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white">
                  Ver productos
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}