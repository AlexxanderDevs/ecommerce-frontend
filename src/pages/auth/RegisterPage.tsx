import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

type RegisterType = 'CLIENTE' | 'VENDEDOR';

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerCustomer, registerSeller } = useAuth();

  const [tipo, setTipo] = useState<RegisterType>('CLIENTE');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const payload = {
        nombres,
        apellidos,
        correo,
        telefono,
        password
      };

      if (tipo === 'CLIENTE') {
        await registerCustomer(payload);
      } else {
        await registerSeller(payload);
      }

      toast.success(
        tipo === 'VENDEDOR'
          ? 'Vendedor registrado correctamente.'
          : 'Cliente registrado correctamente.'
      );

      navigate(tipo === 'VENDEDOR' ? '/seller' : '/');
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo registrar el usuario. Revisa los datos.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Crear cuenta</h1>
        <p className="mt-2 text-slate-600">
          Puedes registrarte como cliente o como vendedor para crear tu tienda.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTipo('CLIENTE')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tipo === 'CLIENTE'
              ? 'bg-white shadow-sm'
              : 'text-slate-600'
              }`}
          >
            Cliente
          </button>

          <button
            type="button"
            onClick={() => setTipo('VENDEDOR')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tipo === 'VENDEDOR'
              ? 'bg-white shadow-sm'
              : 'text-slate-600'
              }`}
          >
            Vendedor
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nombres</label>
              <input
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Apellidos</label>
              <input
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Correo</label>
            <input
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="0999999999"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </div>

          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-slate-900">
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}