import React from 'react';
// Ya no importamos BrowserRouter (Router) aquí
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KDS from './pages/KDS';
import WaiterApp from './pages/WaiterApp';

// Un componente súper simple y flotante para que tú como desarrolladora
// puedas saltar de una pantalla a otra mientras haces pruebas.
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
    // Reemplazamos <Router> con un Fragmento de React
    <>
      {/* Sistema de Rutas */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cocina" element={<KDS />} />
        <Route path="/mesero" element={<WaiterApp />} />
      </Routes>

      {/* Menú flotante de desarrollo (puedes quitarlo antes de entregar el proyecto) */}
      <DevNavigation />
    </>
  );
}