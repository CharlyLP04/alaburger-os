import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultRouteForRole, getUsuario, hasRole, isAuthenticated } from '../utils/auth';

/**
 * Protege rutas verificando autenticación y, opcionalmente, roles permitidos (HU-03).
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Roles con acceso a la ruta
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length > 0 && !hasRole(allowedRoles)) {
    const usuario = getUsuario();
    const fallbackRoute = getDefaultRouteForRole(usuario?.rol);

    if (fallbackRoute !== '/403' && fallbackRoute !== location.pathname) {
      return <Navigate to={fallbackRoute} replace />;
    }

    return <Navigate to="/403" replace state={{ from: location.pathname }} />;
  }

  return children;
}
