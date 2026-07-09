export interface AuthUser {
  id_usuario: string;
  nombres?: string;
  apellidos?: string;
  correo: string;
  telefono?: string | null;
  roles: string[];
}

export interface AuthResponse {
  ok: boolean;
  message: string;
  user: AuthUser;
  accessToken: string;
}

export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  password: string;
}

export interface LoginPayload {
  correo: string;
  password: string;
}