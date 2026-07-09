import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      await login({
        correo,
        password
      });
      toast.success('Inicio de sesión correcto.');
      navigate('/');
    } catch (error) {
      const message = getErrorMessage(error, 'Correo o contraseña incorrectos.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Iniciar sesión</h1>
        <p className="mt-2 text-slate-600">
          Ingresa para administrar tu tienda o consultar tu cuenta.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Correo</label>
            <input
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="********"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-slate-900">
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  );
}