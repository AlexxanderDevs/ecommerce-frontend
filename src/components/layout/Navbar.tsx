import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }
  const { itemsCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <Store className="h-6 w-6" />
          MultiTienda
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Inicio
          </NavLink>

          <NavLink
            to="/stores"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Tiendas
          </NavLink>

          {hasRole('VENDEDOR') && (
            <>
              <NavLink
                to="/seller"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Panel vendedor
              </NavLink>

              <NavLink
                to="/seller/products"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Productos
              </NavLink>
              <NavLink
                to="/seller/orders"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Pedidos
              </NavLink>
            </>
          )}

          {hasRole('ADMIN') && (
            <NavLink
              to="/admin"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative rounded-full border border-slate-200 p-2 hover:bg-slate-50"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1.5 text-xs text-white">
              {itemsCount}
            </span>
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-slate-600 md:flex">
                <UserRound className="h-4 w-4" />
                <span>{user?.correo}</span>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}