import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KDS from './pages/KDS';
import WaiterApp from './pages/WaiterApp';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import Inventario from './pages/Inventario';
import Pedidos from './pages/Pedidos';
import Productos from './pages/Productos';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import ModuloEnDesarrollo from './pages/ModuloEnDesarrollo';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { getDefaultRouteForRole, getUsuario, isAuthenticated } from './utils/auth';



import ErrorBoundary from './components/ErrorBoundary';

function AuthenticatedRedirect() {
  const usuario = getUsuario();
  return <Navigate to={getDefaultRouteForRole(usuario?.rol)} replace />;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <AuthenticatedRedirect />;
  }
  return children;
}

function CatchAllRoute() {
  if (isAuthenticated()) {
    return <AuthenticatedRedirect />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* RUTA DE INGRESO (LOGIN) */}
        <Route
          path="/login"
          element={<PublicRoute><Login /></PublicRoute>}
        />
        
        {/* Criterio de Aceptación: Pantalla de Acceso Denegado 403 */}
        <Route path="/403" element={<Forbidden />} />

        {/* 🔴 RUTAS ADMINISTRATIVAS ENVUELTAS EN EL LAYOUT GLOBAL */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/reportes" element={<ModuloEnDesarrollo modulo="Reportes" />} />
        </Route>

        {/* 🍳 PANTALLA DE COCINA (KDS) */}
        <Route
          path="/cocina"
          element={
            <ProtectedRoute allowedRoles={['cocina', 'administrador']}>
              <KDS />
            </ProtectedRoute>
          }
        />

        {/* 🛒 PANTALLA DE MESEROS (WAITER APP) */}
        <Route
          path="/mesero"
          element={
            <ProtectedRoute allowedRoles={['mesero', 'administrador']}>
              <WaiterApp />
            </ProtectedRoute>
          }
        />

        {/* MANEJO DE RUTAS INEXISTENTES (FALLBACK RESILIENTE) */}
        <Route
          path="*"
          element={<CatchAllRoute />}
        />
      </Routes>
    </ErrorBoundary>
  );
}