const TOKEN_KEY = 'alaburger_token';
const USER_KEY = 'alaburger_usuario';
const AUTH_MESSAGE_KEY = 'alaburger_auth_message';

const DEFAULT_ROUTES_BY_ROLE = {
  administrador: '/',
  cocina: '/cocina',
  mesero: '/mesero',
  cajero: '/caja',
  gerente: '/', // Fallback para cuentas antiguas antes de borrar el rol
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

/** Normaliza el nombre del rol para comparaciones consistentes. */
export function normalizeRole(rol) {
  return typeof rol === 'string' ? rol.trim().toLowerCase() : '';
}

/** Devuelve la ruta de inicio correspondiente al rol del usuario. */
export function getDefaultRouteForRole(rol) {
  return DEFAULT_ROUTES_BY_ROLE[normalizeRole(rol)] ?? '/403';
}

/** Verifica si el usuario autenticado tiene alguno de los roles permitidos. */
export function hasRole(allowedRoles = []) {
  const usuario = getUsuario();
  if (!usuario?.rol || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return false;
  }

  const userRole = normalizeRole(usuario.rol);
  return allowedRoles.some((role) => normalizeRole(role) === userRole);
}

/** Limpia la sesión y guarda un mensaje para mostrar en el login (HU-04). */
export function handleSessionExpired(message = 'Tu sesión ha expirado. Inicia sesión nuevamente.') {
  clearAuth();
  sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
  window.location.assign('/login');
}

/** Lee y elimina el mensaje de autenticación pendiente (p. ej. sesión expirada). */
export function consumeAuthMessage() {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY);
  if (message) {
    sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  }
  return message;
}

export function getInitials(nombre) {
  if (!nombre) return '?';
  return nombre
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
