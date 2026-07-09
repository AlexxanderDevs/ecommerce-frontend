import { Link } from 'react-router-dom';
import { Store, ShoppingBag, ShieldCheck } from 'lucide-react';

export function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
      <div>
        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Plataforma ecommerce multi-tienda
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
          Crea tu tienda virtual y vende por WhatsApp.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Una plataforma donde los clientes pueden navegar productos sin iniciar sesión,
          agregar al carrito y enviar pedidos directamente al WhatsApp del dueño de la tienda.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/stores"
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Ver tiendas
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-white"
          >
            Crear cuenta
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Store className="h-10 w-10 text-slate-900" />
          <h3 className="mt-4 text-xl font-semibold">Multi-tienda</h3>
          <p className="mt-2 text-slate-600">
            Cada vendedor tiene su propia tienda con logo, portada, color, WhatsApp y productos.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ShoppingBag className="h-10 w-10 text-slate-900" />
          <h3 className="mt-4 text-xl font-semibold">Productos flexibles</h3>
          <p className="mt-2 text-slate-600">
            Permite vender ropa, calzado, perfumes, accesorios o cualquier otro producto.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-slate-900" />
          <h3 className="mt-4 text-xl font-semibold">Control administrativo</h3>
          <p className="mt-2 text-slate-600">
            Las tiendas nuevas deben ser aprobadas por el administrador antes de publicarse.
          </p>
        </div>
      </div>
    </section>
  );
}