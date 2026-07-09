import {
  createContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload
} from '../types/auth.types';
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  registerCustomer as registerCustomerRequest,
  registerSeller as registerSellerRequest
} from '../api/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registerCustomer: (payload: RegisterPayload) => Promise<void>;
  registerSeller: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await getMe();

        setUser(response.user);
        setAccessToken(token);
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  async function saveSession(response: {
    user: AuthUser;
    accessToken: string;
  }) {
    localStorage.setItem('accessToken', response.accessToken);
    setAccessToken(response.accessToken);
    setUser(response.user);
  }

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload);
    await saveSession(response);
  }

  async function registerCustomer(payload: RegisterPayload) {
    const response = await registerCustomerRequest(payload);
    await saveSession(response);
  }

  async function registerSeller(payload: RegisterPayload) {
    const response = await registerSellerRequest(payload);
    await saveSession(response);
  }

  async function logout() {
    await logoutRequest();

    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  }

  function hasRole(role: string) {
    return user?.roles?.includes(role) ?? false;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      registerCustomer,
      registerSeller,
      logout,
      hasRole
    }),
    [user, accessToken, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}