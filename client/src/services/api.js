import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
