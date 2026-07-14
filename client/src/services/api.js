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

export async function getProductosList({ page = 1, limit = 20, categoria_id, activo } = {}) {
  const params = new URLSearchParams();
  const filtroPorNombre = categoria_id !== undefined
    && categoria_id !== null
    && categoria_id !== ''
    && Number.isNaN(Number(categoria_id));

  if (filtroPorNombre) {
    params.set('page', '1');
    params.set('limit', '10000');
  } else {
    params.set('page', String(page));
    params.set('limit', String(limit));

    if (categoria_id !== undefined && categoria_id !== null && categoria_id !== '') {
      params.set('categoria_id', String(categoria_id));
    }
  }

  if (activo === true || activo === 'true') {
    params.set('activo', 'true');
  } else if (activo === false || activo === 'false') {
    params.set('activo', 'false');
  }

  const resultado = await apiFetch(`/productos?${params.toString()}`);

  if (!filtroPorNombre) {
    return resultado;
  }

  const filtrados = (resultado.data ?? []).filter(
    (producto) => producto.categoria === categoria_id
  );
  const total = filtrados.length;
  const offset = (page - 1) * limit;

  return {
    data: filtrados.slice(offset, offset + limit),
    total,
    page,
    totalPages: total === 0 ? 1 : Math.ceil(total / limit),
  };
}

export async function getCategoriasProducto() {
  const resultado = await getProductosList({ page: 1, limit: 10000 });
  const categoriasMap = new Map();

  for (const producto of resultado.data ?? []) {
    if (
      producto.categoria_id == null ||
      !producto.categoria ||
      categoriasMap.has(producto.categoria_id)
    ) {
      continue;
    }

    categoriasMap.set(producto.categoria_id, {
      id: producto.categoria_id,
      nombre: producto.categoria,
    });
  }

  return Array.from(categoriasMap.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es')
  );
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

export function crearIngrediente(payload) {
  return apiFetch('/inventario', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function editarIngrediente(id, payload) {
  return apiFetch(`/inventario/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function registrarEntrada(id, payload) {
  return apiFetch(`/inventario/${id}/entrada`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAlertasStockBajo() {
  return apiFetch('/inventario/alertas/resumen');
}
