import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { hasRole, isAuthenticated } from '../utils/auth';

/**
 * Protege rutas verificando autenticación y, opcionalmente, roles permitidos (HU-03).
 * Si el usuario no tiene el rol requerido, lo manda directo a la pantalla de Acceso Denegado (403).
 * 
 * @param {object} props
 * @param {React.ReactNode} [props.children] - Componente hijo opcional (para uso directo)
 * @param {string[]} [props.allowedRoles] - Roles autorizados para acceder a la ruta
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  // 1. Criterio de Aceptación: Si no está autenticado, va al login guardando el origen
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Criterio de Aceptación: Si tiene un rol no autorizado -> Directo al /403 sin escalas
  if (allowedRoles?.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/403" replace state={{ from: location.pathname }} />;
  }

  // Si pasa las validaciones, renderiza los hijos directos o el Outlet del layout
  return children ? children : <Outlet />;
}