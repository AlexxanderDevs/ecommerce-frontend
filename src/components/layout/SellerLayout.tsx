import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, Package, Store, BarChart3 } from 'lucide-react';

const sellerLinks = [
  {
    to: '/seller',
    label: 'Mis tiendas',
    description: 'Solicitudes y tiendas aprobadas',
    icon: Store
  },
  {
    to: '/seller/dashboard',
    label: 'Resumen',
    description: 'Ventas, pedidos y stock',
    icon: BarChart3
  },
  {
    to: '/seller/reports',
    label: 'Reportes',
    description: 'Ventas y productos vendidos',
    icon: BarChart3
  },
  {
    to: '/seller/products',
    label: 'Productos',
    description: 'Categorías, productos y variantes',
    icon: Package
  },
  {
    to: '/seller/orders',
    label: 'Pedidos',
    description: 'Pedidos, stock y facturas',
    icon: ClipboardList
  }
];

export function SellerLayout() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <LayoutDashboard className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Panel del vendedor</h1>
            <p className="mt-1 text-slate-600">
              Administra tus tiendas, productos, pedidos y facturas desde un solo lugar.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sellerLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/seller'}
                className={({ isActive }) =>
                  `rounded-2xl border p-4 transition ${isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-bold">{link.label}</span>
                </div>

                <p className="mt-2 text-sm opacity-80">{link.description}</p>
              </NavLink>
            );
          })}
        </div>
      </div>

      <Outlet />
    </section>
  );
}