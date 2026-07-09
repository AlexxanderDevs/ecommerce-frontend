import { http } from './http';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from '../types/auth.types';

export async function registerCustomer(payload: RegisterPayload) {
  const { data } = await http.post<AuthResponse>(
    '/auth/register/customer',
    payload
  );

  return data;
}

export async function registerSeller(payload: RegisterPayload) {
  const { data } = await http.post<AuthResponse>(
    '/auth/register/seller',
    payload
  );

  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await http.post<AuthResponse>(
    '/auth/login',
    payload
  );

  return data;
}

export async function logout() {
  const { data } = await http.post('/auth/logout');
  return data;
}

export async function getMe() {
  const { data } = await http.get('/auth/me');
  return data;
}