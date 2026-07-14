import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KDS from './pages/KDS';
import WaiterApp from './pages/WaiterApp';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import Inventario from './pages/Inventario';
import ModuloEnDesarrollo from './pages/ModuloEnDesarrollo';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import { getDefaultRouteForRole, getUsuario, isAuthenticated } from './utils/auth';

function DevNavigation() {
  return (
    <div className="fixed bottom-4 right-4 bg-card border border-[#1E1E1E] p-2 rounded-xl flex gap-2 z-50 shadow-2xl opacity-40 hover:opacity-100 transition-opacity">
      <Link to="/" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        Admin
      </Link>
      <Link to="/cocina" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        Cocina
      </Link>
      <Link to="/mesero" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        Mesero
      </Link>
    </div>
  );
}

function AuthenticatedRedirect() {
  const usuario = getUsuario();
  return <Navigate to={getDefaultRouteForRole(usuario?.rol)} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <AuthenticatedRedirect /> : <Login />}
        />
        <Route path="/403" element={<Forbidden />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Inventario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <ModuloEnDesarrollo modulo="Pedidos" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sucursales"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <ModuloEnDesarrollo modulo="Sucursales" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <ModuloEnDesarrollo modulo="Usuarios" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <ModuloEnDesarrollo modulo="Reportes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cocina"
          element={
            <ProtectedRoute allowedRoles={['cocina', 'administrador']}>
              <KDS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesero"
          element={
            <ProtectedRoute allowedRoles={['mesero', 'administrador']}>
              <WaiterApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={isAuthenticated() ? <AuthenticatedRedirect /> : <Navigate to="/login" replace />}
        />
      </Routes>

      <DevNavigation />
    </>
  );
}
