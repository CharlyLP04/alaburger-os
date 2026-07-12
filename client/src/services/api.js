import { getToken, handleSessionExpired } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function isTokenAuthError(status, data, hadToken) {
  if (!hadToken) return false;

  if (status === 401) return true;

  if (status === 403) {
    const errorCode = data?.error?.toLowerCase?.() ?? '';
    return errorCode.includes('token');
  }

  return false;
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (isTokenAuthError(response.status, data, Boolean(token))) {
      handleSessionExpired(
        data.mensaje || 'Tu sesión ha expirado. Inicia sesión nuevamente.'
      );
    }

    const error = new Error(data.mensaje || data.error || 'Error en la solicitud');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getProductos() {
  return apiFetch('/productos');
}

export function crearPedido(payload) {
  return apiFetch('/pedidos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getInventario(stockBajo = false) {
  const query = stockBajo ? '?stock_bajo=true' : '';
  return apiFetch(`/inventario${query}`);
}
