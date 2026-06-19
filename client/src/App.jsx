import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KDS from './pages/KDS';
import WaiterApp from './pages/WaiterApp';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

function DevNavigation() {
  return (
    <div className="fixed bottom-4 right-4 bg-card border border-[#1E1E1E] p-2 rounded-xl flex gap-2 z-50 shadow-2xl opacity-40 hover:opacity-100 transition-opacity">
      <Link to="/" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        📊 Admin
      </Link>
      <Link to="/cocina" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        🍳 Cocina
      </Link>
      <Link to="/mesero" className="text-xs bg-[#1E1E1E] hover:bg-primary text-foreground hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
        📱 Mesero
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cocina"
          element={
            <ProtectedRoute>
              <KDS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesero"
          element={
            <ProtectedRoute>
              <WaiterApp />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DevNavigation />
    </>
  );
}
