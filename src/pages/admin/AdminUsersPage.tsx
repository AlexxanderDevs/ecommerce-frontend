import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type FormEvent
} from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  Users,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminUsers
} from '../../api/user.api';
import type { AdminUser } from '../../types/admin-user.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

type UserStatusFilter = 'TODOS' | 'ACTIVO' | 'INACTIVO';
type UserRoleFilter = 'TODOS' | 'ADMIN' | 'VENDEDOR' | 'CLIENTE';
type UserActionType = 'ACTIVATE' | 'DEACTIVATE';

interface UserActionModalState {
  type: UserActionType;
  user: AdminUser;
}

const statusStyles: Record<AdminUser['estado'], string> = {
  ACTIVO: 'bg-green-50 text-green-700 border-green-200',
  INACTIVO: 'bg-red-50 text-red-700 border-red-200',
  ELIMINADO: 'bg-zinc-50 text-zinc-700 border-zinc-200'
};

const statusFilters: Array<{
  value: UserStatusFilter;
  label: string;
}> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ACTIVO', label: 'Activos' },
  { value: 'INACTIVO', label: 'Inactivos' }
];

const roleFilters: Array<{
  value: UserRoleFilter;
  label: string;
}> = [
  { value: 'TODOS', label: 'Todos los roles' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'VENDEDOR', label: 'Vendedores' },
  { value: 'CLIENTE', label: 'Clientes' }
];

function hasRole(user: AdminUser, role: string) {
  return user.roles.some((item) => item.codigo === role);
}

function getRoleLabel(user: AdminUser) {
  if (user.roles.length === 0) {
    return 'Sin rol';
  }

  return user.roles.map((role) => role.codigo).join(', ');
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const [selectedStatus, setSelectedStatus] =
    useState<UserStatusFilter>('TODOS');

  const [selectedRole, setSelectedRole] =
    useState<UserRoleFilter>('TODOS');

  const [search, setSearch] = useState('');

  const [actionModal, setActionModal] =
    useState<UserActionModalState | null>(null);

  const [actionObservation, setActionObservation] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const data = await getAdminUsers();
      setUsers(data);

      if (selectedUser) {
        const updatedSelectedUser = data.find(
          (user) => user.id_usuario === selectedUser.id_usuario
        );

        setSelectedUser(updatedSelectedUser ?? null);
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar los usuarios.'
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function openDeactivateModal(user: AdminUser) {
    setActionModal({
      type: 'DEACTIVATE',
      user
    });

    setActionObservation('Usuario desactivado por el administrador.');
  }

  function openActivateModal(user: AdminUser) {
    setActionModal({
      type: 'ACTIVATE',
      user
    });

    setActionObservation('Usuario activado por el administrador.');
  }

  function closeActionModal() {
    if (actionLoading) {
      return;
    }

    setActionModal(null);
    setActionObservation('');
  }

  async function handleConfirmUserAction() {
    if (!actionModal) {
      return;
    }

    const observacion = actionObservation.trim();

    if (observacion.length < 5) {
      toast.error('Escribe un motivo válido.');
      return;
    }

    try {
      setActionLoading(actionModal.user.id_usuario);

      if (actionModal.type === 'DEACTIVATE') {
        await deactivateAdminUser(actionModal.user.id_usuario, observacion);
        toast.success('Usuario desactivado correctamente.');
      } else {
        await activateAdminUser(actionModal.user.id_usuario, observacion);
        toast.success('Usuario activado correctamente.');
      }

      setActionModal(null);
      setActionObservation('');

      await loadUsers();
    } catch (error) {
      const message = getErrorMessage(
        error,
        actionModal.type === 'DEACTIVATE'
          ? 'No se pudo desactivar el usuario.'
          : 'No se pudo activar el usuario.'
      );

      toast.error(message);
    } finally {
      setActionLoading('');
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus =
        selectedStatus === 'TODOS' || user.estado === selectedStatus;

      const matchesRole =
        selectedRole === 'TODOS' || hasRole(user, selectedRole);

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        searchValue.length === 0 ||
        user.nombres.toLowerCase().includes(searchValue) ||
        user.correo.toLowerCase().includes(searchValue) ||
        getRoleLabel(user).toLowerCase().includes(searchValue);

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [users, selectedStatus, selectedRole, search]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.estado === 'ACTIVO').length;
  const inactiveUsers = users.filter((user) => user.estado === 'INACTIVO').length;
  const sellers = users.filter((user) => hasRole(user, 'VENDEDOR')).length;
  const clients = users.filter((user) => hasRole(user, 'CLIENTE')).length;
  const admins = users.filter((user) => hasRole(user, 'ADMIN')).length;

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de usuarios</h1>
          <p className="mt-2 text-slate-600">
            Administra clientes, vendedores y usuarios administradores del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard
          title="Total"
          value={totalUsers}
          description="Usuarios registrados"
          icon={Users}
          tone="slate"
        />

        <SummaryCard
          title="Activos"
          value={activeUsers}
          description="Usuarios habilitados"
          icon={CheckCircle2}
          tone="green"
        />

        <SummaryCard
          title="Inactivos"
          value={inactiveUsers}
          description="Usuarios bloqueados"
          icon={XCircle}
          tone="red"
        />

        <SummaryCard
          title="Vendedores"
          value={sellers}
          description="Usuarios vendedores"
          icon={Store}
          tone="blue"
        />

        <SummaryCard
          title="Clientes"
          value={clients}
          description="Usuarios clientes"
          icon={UserRound}
          tone="yellow"
        />

        <SummaryCard
          title="Admins"
          value={admins}
          description="Administradores"
          icon={ShieldCheck}
          tone="slate"
        />
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="text-sm font-medium">Buscar usuario</label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-900"
                placeholder="Buscar por nombre, correo o rol..."
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedStatus('TODOS');
              setSelectedRole('TODOS');
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Filtrar por estado</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedStatus === filter.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Filtrar por rol</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {roleFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedRole(filter.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedRole === filter.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Mostrando {filteredUsers.length} de {users.length} usuarios.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3">Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No hay usuarios para mostrar</h2>
          <p className="mt-2 text-slate-600">
            Cambia los filtros o intenta con otra búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <AdminUserCard
                key={user.id_usuario}
                user={user}
                loading={actionLoading === user.id_usuario}
                onView={() => setSelectedUser(user)}
                onActivate={() => openActivateModal(user)}
                onDeactivate={() => openDeactivateModal(user)}
              />
            ))}
          </div>

          <div>
            {!selectedUser ? (
              <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                <Eye className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3">
                  Selecciona un usuario para ver su información completa.
                </p>
              </div>
            ) : (
              <UserDetailPanel
                user={selectedUser}
                loading={actionLoading === selectedUser.id_usuario}
                onActivate={() => openActivateModal(selectedUser)}
                onDeactivate={() => openDeactivateModal(selectedUser)}
              />
            )}
          </div>
        </div>
      )}

      {actionModal && (
        <UserActionModal
          modal={actionModal}
          observation={actionObservation}
          loading={actionLoading === actionModal.user.id_usuario}
          onChangeObservation={setActionObservation}
          onClose={closeActionModal}
          onConfirm={handleConfirmUserAction}
        />
      )}
    </section>
  );
}

interface AdminUserCardProps {
  user: AdminUser;
  loading: boolean;
  onView: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}

function AdminUserCard({
  user,
  loading,
  onView,
  onActivate,
  onDeactivate
}: AdminUserCardProps) {
  const isAdmin = hasRole(user, 'ADMIN');
  const canActivate = user.estado === 'INACTIVO' && !isAdmin;
  const canDeactivate = user.estado === 'ACTIVO' && !isAdmin;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
            {isAdmin ? (
              <ShieldCheck className="h-7 w-7 text-slate-600" />
            ) : hasRole(user, 'VENDEDOR') ? (
              <Store className="h-7 w-7 text-slate-600" />
            ) : (
              <UserRound className="h-7 w-7 text-slate-600" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">{user.nombres}</h3>
            <p className="text-sm text-slate-500">{user.correo}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                  statusStyles[user.estado]
                }`}
              >
                {user.estado}
              </span>

              {user.roles.map((role) => (
                <span
                  key={role.id_rol}
                  className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {role.codigo}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            Ver
          </button>

          {canDeactivate && (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Desactivar
            </button>
          )}

          {canActivate && (
            <button
              type="button"
              onClick={onActivate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Activar
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <p>
          <strong>Tiendas:</strong> {user.cantidad_tiendas}
        </p>

        <p>
          <strong>Pedidos:</strong> {user.cantidad_pedidos}
        </p>

        <p>
          <strong>Compras:</strong> ${Number(user.total_compras).toFixed(2)}
        </p>
      </div>
    </article>
  );
}

interface UserDetailPanelProps {
  user: AdminUser;
  loading: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

function UserDetailPanel({
  user,
  loading,
  onActivate,
  onDeactivate
}: UserDetailPanelProps) {
  const isAdmin = hasRole(user, 'ADMIN');
  const canActivate = user.estado === 'INACTIVO' && !isAdmin;
  const canDeactivate = user.estado === 'ACTIVO' && !isAdmin;

  return (
    <aside className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
          {isAdmin ? (
            <ShieldCheck className="h-8 w-8 text-slate-600" />
          ) : hasRole(user, 'VENDEDOR') ? (
            <Store className="h-8 w-8 text-slate-600" />
          ) : (
            <UserRound className="h-8 w-8 text-slate-600" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{user.nombres}</h2>
          <p className="text-sm text-slate-500">{user.correo}</p>

          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[user.estado]
            }`}
          >
            {user.estado}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-slate-200" />

      <div className="space-y-3 text-sm text-slate-700">
        <p>
          <strong>Roles:</strong> {getRoleLabel(user)}
        </p>

        <p>
          <strong>Tiendas creadas:</strong> {user.cantidad_tiendas}
        </p>

        <p>
          <strong>Pedidos realizados:</strong> {user.cantidad_pedidos}
        </p>

        <p>
          <strong>Total compras:</strong> ${Number(user.total_compras).toFixed(2)}
        </p>

        <p>
          <strong>Fecha registro:</strong>{' '}
          {new Date(user.fecha_creacion).toLocaleString()}
        </p>

        {user.fecha_actualizacion && (
          <p>
            <strong>Última actualización:</strong>{' '}
            {new Date(user.fecha_actualizacion).toLocaleString()}
          </p>
        )}
      </div>

      {isAdmin && (
        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Los usuarios administradores no se pueden activar o desactivar desde esta vista.
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {canDeactivate && (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Desactivar usuario
          </button>
        )}

        {canActivate && (
          <button
            type="button"
            onClick={onActivate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Activar usuario
          </button>
        )}
      </div>
    </aside>
  );
}

interface UserActionModalProps {
  modal: UserActionModalState;
  observation: string;
  loading: boolean;
  onChangeObservation: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function UserActionModal({
  modal,
  observation,
  loading,
  onChangeObservation,
  onClose,
  onConfirm
}: UserActionModalProps) {
  const isDeactivate = modal.type === 'DEACTIVATE';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-2xl p-3 ${
              isDeactivate
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {isDeactivate ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">
              {isDeactivate ? 'Desactivar usuario' : 'Activar usuario'}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {isDeactivate
                ? 'Escribe el motivo por el cual se desactivará este usuario.'
                : 'Escribe el motivo por el cual se activará este usuario.'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold">{modal.user.nombres}</p>
          <p className="mt-1 text-xs text-slate-500">{modal.user.correo}</p>
          <p className="mt-1 text-xs text-slate-500">
            Estado actual: {modal.user.estado}
          </p>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium">
            Motivo de {isDeactivate ? 'desactivación' : 'activación'}
          </label>

          <textarea
            value={observation}
            onChange={(event) => onChangeObservation(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder={
              isDeactivate
                ? 'Ejemplo: Usuario bloqueado por incumplir políticas.'
                : 'Ejemplo: Usuario habilitado nuevamente por el administrador.'
            }
            required
          />

          <p className="mt-2 text-xs text-slate-500">
            Este motivo será enviado al backend como observación de la acción.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white disabled:opacity-60 ${
              isDeactivate
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeactivate ? 'Desactivar usuario' : 'Activar usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  tone: 'yellow' | 'green' | 'red' | 'blue' | 'slate';
}

const summaryTones: Record<
  SummaryCardProps['tone'],
  {
    icon: string;
    value: string;
  }
> = {
  yellow: {
    icon: 'bg-yellow-50 text-yellow-700',
    value: 'text-yellow-700'
  },
  green: {
    icon: 'bg-green-50 text-green-700',
    value: 'text-green-700'
  },
  red: {
    icon: 'bg-red-50 text-red-700',
    value: 'text-red-700'
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    value: 'text-blue-700'
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700',
    value: 'text-slate-900'
  }
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone
}: SummaryCardProps) {
  const styles = summaryTones[tone];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${styles.value}`}>
            {value}
          </p>
        </div>

        <div className={`rounded-2xl p-3 ${styles.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </article>
  );
}