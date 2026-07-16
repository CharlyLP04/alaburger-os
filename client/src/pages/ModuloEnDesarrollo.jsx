import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getInitials, getUsuario } from '../utils/auth';

export default function ModuloEnDesarrollo({ modulo }) {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const getModuloIcon = () => {
    switch (modulo.toLowerCase()) {
      case 'pedidos': return ICONS.bag;
      case 'productos': return ICONS.box;
      case 'sucursales': return ICONS.store;
      case 'usuarios': return ICONS.users;
      case 'reportes': return ICONS.chart;
      default: return ICONS.box;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0E0E10] text-white font-sans selection:bg-primary/30">
      
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-[#09090A] border-r border-[#1F1F23] flex flex-col justify-between h-screen sticky top-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-[#1F1F23] flex items-center gap-3">
            <div className="bg-[#E8530A] text-white font-black w-6 h-6 rounded flex items-center justify-center text-xs tracking-wider">
              A
            </div>
            <h2 className="font-black tracking-widest text-sm uppercase">A LA BURGER OS</h2>
          </div>

          {/* Sección de Navegación */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase px-2 mb-3">
              Navegación
            </p>
            <nav className="space-y-1">
              <Link 
                to="/" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.dashboard} size={18} />
                  <span>Dashboard</span>
                </div>
              </Link>

              <Link 
                to="/pedidos" 
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                  modulo === 'Pedidos' 
                    ? 'bg-[#141416] border-l-2 border-[#E8530A] text-[#E8530A] font-bold' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#141416] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.bag} size={18} />
                  <span>Pedidos</span>
                </div>
              </Link>

              <Link 
                to="/cocina" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.chef} size={18} />
                  <span>Cocina</span>
                </div>
              </Link>

              <Link 
                to="/inventario" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.box} size={18} />
                  <span>Inventario</span>
                </div>
              </Link>

              {["Productos", "Usuarios", "Reportes"].map((item, index) => {
                const iconMap = [ICONS.box, ICONS.users, ICONS.chart];
                const isActive = modulo === item;
                return (
                  <Link 
                    key={index}
                    to={`/${item.toLowerCase()}`} 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive 
                        ? 'bg-[#141416] border-l-2 border-[#E8530A] text-[#E8530A] font-bold' 
                        : 'text-neutral-400 hover:text-white hover:bg-[#141416] font-medium'
                    }`}
                  >
                    <Icon path={iconMap[index]} size={18} />
                    <span>{item}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Perfil / Cerrar Sesión en Sidebar */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#09090A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E8530A] to-amber-500 flex items-center justify-center text-xs font-black text-white">
              {getInitials(usuario?.nombre)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{usuario?.nombre || 'Usuario'}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase truncate">
                {usuario?.rol || 'Rol'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-center text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141416] hover:bg-neutral-800 border border-[#1F1F23] hover:border-neutral-600 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. BARRA SUPERIOR (TOP BAR) */}
        <header className="h-16 border-b border-[#1F1F23] bg-[#09090A]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Breadcrumb */}
          <div className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
            A LA BURGER OS <span className="text-neutral-600 mx-1">/</span> <span className="text-white">{modulo}</span>
          </div>

          {/* Buscador y Controles de Usuario */}
          <div className="flex items-center gap-6">
            {/* Buscador */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500">
                <Icon path={ICONS.search} size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full bg-[#141416] border border-[#1F1F23] rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast('Buscador: Función en desarrollo para una futura HU.', 'info');
                  }
                }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-neutral-500 font-bold bg-[#09090A] px-2 my-2 border border-[#1F1F23] rounded-lg">
                ⌘K
              </span>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-3 text-neutral-300 border-r border-[#1F1F23] pr-6">
              <button 
                onClick={() => showToast('Datos actualizados correctamente.', 'success')}
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors cursor-pointer"
                title="Actualizar datos"
              >
                <Icon path={ICONS.refresh} size={22} />
              </button>
              <button 
                onClick={() => showToast('Stock bajo: Pan Burger (10) • Carne Res (15)', 'warning')}
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors relative cursor-pointer"
                title="Ver notificaciones"
              >
                <Icon path={ICONS.bell} size={22} />
                <span className="absolute top-1 right-1 w-5.5 h-5.5 bg-[#E8530A] text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-[#09090A]">
                  2
                </span>
              </button>
              <button 
                onClick={() => showToast('Ajustes del sistema: Módulo en desarrollo.', 'info')}
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors cursor-pointer"
                title="Configuración"
              >
                <Icon path={ICONS.settings} size={22} />
              </button>
            </div>

            {/* Perfil del Administrador */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight">{usuario?.nombre || 'Usuario'}</p>
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{usuario?.rol || 'Rol'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E8530A] to-amber-500 flex items-center justify-center text-xs font-black text-white">
                {getInitials(usuario?.nombre)}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 hover:text-white border border-[#1F1F23] hover:border-neutral-600 bg-[#141416] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* 3. ÁREA DE TRABAJO */}
        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-md w-full bg-[#141416] border border-[#1F1F23] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden group">
            {/* Fondo de brillo sutil */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E8530A]/10 rounded-full blur-3xl group-hover:bg-[#E8530A]/15 transition-all duration-500"></div>
            
            <div className="text-[#E8530A] bg-[#E8530A]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-105 duration-300">
              <Icon path={getModuloIcon()} size={32} />
            </div>

            <h1 className="text-xl font-black tracking-wide text-white uppercase mb-2">
              Módulo de {modulo}
            </h1>
            
            <div className="inline-block bg-[#E8530A]/10 border border-[#E8530A]/30 text-[#E8530A] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 animate-pulse">
              En Desarrollo
            </div>

            <p className="text-xs text-neutral-400 font-bold leading-relaxed mb-8 max-w-sm mx-auto uppercase tracking-wide">
              Estamos trabajando en esta sección. Estará disponible en una futura historia de usuario (HU).
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center text-xs font-black uppercase tracking-wider text-white bg-[#E8530A] hover:bg-[#ff6214] px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#E8530A]/20 cursor-pointer"
            >
              Volver al Dashboard
            </Link>
          </div>
        </main>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#141416] border-2 border-neutral-800 rounded-2xl px-6 py-4 shadow-2xl min-w-[380px] max-w-lg animate-in slide-in-from-top-8 fade-in duration-300">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-success/10 text-success border border-success/30' :
            toast.type === 'warning' ? 'bg-destructive/10 text-destructive border border-destructive/30' : 
            'bg-[#E8530A]/10 text-[#E8530A] border border-[#E8530A]/30'
          }`}>
            <Icon 
              path={toast.type === 'success' ? ICONS.check : toast.type === 'warning' ? ICONS.bell : ICONS.settings} 
              size={20} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white uppercase tracking-wide leading-tight">
              {toast.type === 'success' ? 'Éxito' : toast.type === 'warning' ? 'Advertencia' : 'Información'}
            </p>
            <p className="text-xs font-bold text-neutral-400 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="text-neutral-500 hover:text-white ml-2 p-2 hover:bg-[#1C1C1F] rounded-lg transition-colors cursor-pointer text-sm font-black"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
