import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Icon, ICONS } from '../ui/Icon';
import { Toast } from '../ui/Toast';
import { clearAuth, getInitials, getUsuario } from '../../utils/auth';
import { globalSearch } from '../../services/api';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [toast, setToast] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await globalSearch(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error in search', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Define the navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: ICONS.dashboard },
    { path: '/pedidos', label: 'Pedidos', icon: ICONS.bag, badge: 12 },
    { path: '/cocina', label: 'Cocina', icon: ICONS.chef },
    { path: '/productos', label: 'Productos', icon: ICONS.box },
    { path: '/inventario', label: 'Inventario', icon: ICONS.box },
    { path: '/usuarios', label: 'Usuarios', icon: ICONS.users },
    { path: '/reportes', label: 'Reportes', icon: ICONS.chart },
  ];

  // Helper to check if a route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  // Get current page name for Breadcrumbs
  const currentNav = useMemo(() => {
    return navItems.find(item => isActive(item.path) && item.path !== '/') || navItems[0];
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#0E0E10] text-white font-sans selection:bg-primary/30">
      
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-[#09090A] border-r border-[#1F1F23] flex flex-col justify-between h-screen sticky top-0 z-50">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-[#1F1F23] flex items-center gap-3 shrink-0">
            <div className="bg-[#E8530A] text-white font-black w-6 h-6 rounded flex items-center justify-center text-xs tracking-wider shadow-[0_0_15px_rgba(232,83,10,0.4)]">
              A
            </div>
            <h2 className="font-black tracking-widest text-sm uppercase">A LA BURGER OS</h2>
          </div>

          {/* Sección de Navegación */}
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase px-2 mb-3">
              Navegación
            </p>
            <nav className="space-y-1">
              {navItems.map((item, index) => {
                const active = isActive(item.path);
                return (
                  <Link 
                    key={index}
                    to={item.path} 
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      active 
                        ? 'bg-[#E8530A]/10 text-[#E8530A] font-bold' 
                        : 'text-neutral-400 hover:text-white hover:bg-[#141416]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon 
                        path={item.icon} 
                        size={18} 
                        className={active ? "text-[#E8530A]" : "text-neutral-500 group-hover:text-white transition-colors"} 
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                        active 
                          ? 'bg-[#E8530A] text-white shadow-[0_0_10px_rgba(232,83,10,0.5)]' 
                          : 'bg-[#1F1F23] text-neutral-400 group-hover:bg-[#E8530A]/20 group-hover:text-[#E8530A]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Estado del Sistema */}
          <div className="p-4 border-t border-[#1F1F23] bg-[#050506] shrink-0">
            <div className="flex items-center justify-between text-xs font-bold tracking-wide mb-2">
              <span className="text-neutral-500 uppercase">Sistema</span>
              <span className="text-success flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> ONLINE
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>CPU - Carga del sistema</span>
                <span className="font-bold text-white">24%</span>
              </div>
              <div className="w-full bg-[#1F1F23] h-1.5 rounded-full overflow-hidden">
                <div className="bg-success h-full w-[24%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="mt-4 pt-4 border-t border-[#1F1F23] flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E8530A]/20 to-[#E8530A]/5 border border-[#E8530A]/20 text-[#E8530A] flex items-center justify-center font-bold text-sm">
                  {getInitials(usuario?.nombre)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{usuario?.nombre} {usuario?.apellido}</p>
                  <p className="text-xs text-neutral-500 capitalize truncate">{usuario?.rol}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. BARRA SUPERIOR (TOP BAR) */}
        <header className="h-16 border-b border-[#1F1F23] bg-[#09090A]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Breadcrumb */}
          <div className="text-xs font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
            A LA BURGER OS 
            <span className="text-neutral-700">/</span> 
            <span className="text-[#E8530A]">{currentNav?.label || 'DASHBOARD'}</span>
          </div>

          {/* Buscador y Controles de Usuario */}
          <div className="flex items-center gap-6">
            {/* Buscador */}
            <div className="relative w-64 hidden lg:block" ref={searchRef}>
              <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500">
                <Icon path={ICONS.search} size={16} />
              </span>
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchResults(true);
                }}
                placeholder="Buscar pedido, prod..." 
                className="w-full bg-[#141416] border border-[#1F1F23] rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#E8530A] transition-colors"
              />
              {!searchQuery && (
                <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-neutral-500 font-bold bg-[#09090A] px-2 my-2 border border-[#1F1F23] rounded-lg">
                  ⌘K
                </span>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (searchQuery.trim() !== '') && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#141416] border border-[#1F1F23] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
                  {isSearching ? (
                    <div className="p-4 text-center text-neutral-500 text-sm font-bold flex items-center justify-center gap-2">
                      <Icon path={ICONS.refresh} size={16} className="animate-spin" />
                      Buscando...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500 text-sm">
                      No se encontraron resultados para "{searchQuery}"
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {searchResults.map((res) => (
                        <div 
                          key={`${res.type}-${res.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            // Determine route based on type
                            if (res.type === 'producto') navigate('/productos');
                            if (res.type === 'usuario') navigate('/usuarios');
                            if (res.type === 'inventario') navigate('/inventario');
                            if (res.type === 'pedido') navigate('/pedidos');
                          }}
                          className="px-4 py-3 hover:bg-[#1C1C1F] border-b border-[#1F1F23] last:border-0 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#27272A] flex items-center justify-center text-neutral-400 shrink-0">
                            {res.type === 'producto' && <Icon path={ICONS.box} size={16} />}
                            {res.type === 'usuario' && <Icon path={ICONS.users} size={16} />}
                            {res.type === 'inventario' && <Icon path={ICONS.box} size={16} />}
                            {res.type === 'pedido' && <Icon path={ICONS.bag} size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-200 font-bold truncate">{res.title}</p>
                            <p className="text-[10px] text-neutral-500 truncate uppercase tracking-wider">{res.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-3 text-neutral-300 border-r border-[#1F1F23] pr-6">
              <button 
                onClick={() => setToast({ message: 'Actualizando datos...', type: 'info' })}
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors cursor-pointer"
                title="Actualizar datos"
              >
                <Icon path={ICONS.refresh} size={22} />
              </button>
              <button 
                onClick={() => setToast({ message: 'Tienes 2 notificaciones nuevas', type: 'info' })}
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors relative cursor-pointer"
                title="Ver notificaciones"
              >
                <Icon path={ICONS.bell} size={22} />
                <span className="absolute top-1 right-1 w-5.5 h-5.5 bg-[#E8530A] text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-[#09090A]">
                  2
                </span>
              </button>
              <Link 
                to="/configuracion"
                className="p-3 hover:text-white rounded-xl hover:bg-[#141416] transition-colors cursor-pointer inline-flex items-center justify-center"
                title="Configuración"
              >
                <Icon path={ICONS.settings} size={22} />
              </Link>
            </div>

            {/* Perfil de Usuario */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-tight">{usuario?.nombre || 'Usuario'}</p>
                <p className="text-[10px] text-[#E8530A] font-black tracking-wider uppercase">{usuario?.rol || 'Sin rol'}</p>
              </div>
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8530A] to-[#ff7333] font-bold text-xs flex items-center justify-center shadow-[0_0_15px_rgba(232,83,10,0.3)] border border-white/10"
              >
                {getInitials(usuario?.nombre)}
              </div>
            </div>
          </div>
        </header>

        {/* 3. ÁREA DE TRABAJO (RENDERIZA LAS RUTAS HIJAS AQUÍ) */}
        <Outlet />
      </div>

      {/* Toast Global desde el Layout */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
