import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';

export default function Dashboard() {
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
                className="flex items-center justify-between px-3 py-2.5 bg-[#141416] rounded-lg border-l-2 border-[#E8530A] text-[#E8530A] font-bold text-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.dashboard} size={18} />
                  <span>Dashboard</span>
                </div>
              </Link>

              <Link 
                to="/pedidos" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.bag} size={18} />
                  <span>Pedidos</span>
                </div>
                <span className="bg-[#E8530A]/20 text-[#E8530A] text-xs font-bold px-2 py-0.5 rounded-full">
                  12
                </span>
              </Link>

              <Link 
                to="/cocina" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.chef} size={18} />
                  <span>Cocina</span>
                </div>
                <span className="bg-[#E8530A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  4
                </span>
              </Link>

              <Link 
                to="/inventario" 
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.box} size={18} />
                  <span>Inventario</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-1"></div>
              </Link>

              {["Productos", "Sucursales", "Usuarios", "Reportes"].map((item, index) => {
                const iconMap = [ICONS.box, ICONS.store, ICONS.users, ICONS.chart];
                return (
                  <Link 
                    key={index}
                    to={`/${item.toLowerCase()}`} 
                    className="flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
                  >
                    <Icon path={iconMap[index]} size={18} />
                    <span>{item}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#050506]">
          <div className="flex items-center justify-between text-xs font-bold tracking-wide mb-2">
            <span className="text-neutral-500 uppercase">Sistema</span>
            <span className="text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> ONLINE
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>CPU - Carga del sistema</span>
              <span className="font-bold">73%</span>
            </div>
            <div className="w-full bg-[#1F1F23] h-1.5 rounded-full overflow-hidden">
              <div className="bg-success h-full w-[73%] rounded-full"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. BARRA SUPERIOR (TOP BAR) */}
        <header className="h-16 border-b border-[#1F1F23] bg-[#09090A]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Breadcrumb */}
          <div className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
            A LA BURGER OS <span className="text-neutral-600 mx-1">/</span> <span className="text-white">Dashboard</span>
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
                placeholder="Buscar pedido, prod..." 
                className="w-full bg-[#141416] border border-[#1F1F23] rounded-lg pl-9 pr-8 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-neutral-600 font-bold bg-[#09090A] px-1.5 my-1.5 border border-[#1F1F23] rounded">
                ⌘K
              </span>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-2 text-neutral-400 border-r border-[#1F1F23] pr-4">
              <button className="p-2 hover:text-white rounded-lg hover:bg-[#141416] transition-colors">
                <Icon path={ICONS.refresh} size={16} />
              </button>
              <button className="p-2 hover:text-white rounded-lg hover:bg-[#141416] transition-colors relative">
                <Icon path={ICONS.bell} size={16} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E8530A] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#09090A]">
                  3
                </span>
              </button>
              <button className="p-2 hover:text-white rounded-lg hover:bg-[#141416] transition-colors">
                <Icon path={ICONS.settings} size={16} />
              </button>
            </div>

            {/* Perfil del Administrador */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight">Marco Reyes</p>
                <p className="text-[10px] text-[#E8530A] font-black tracking-wider uppercase">Gerente General</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E8530A] font-bold text-xs flex items-center justify-center shadow-lg border border-[#E8530A]/30">
                MR
              </div>
            </div>
          </div>
        </header>

        {/* 3. ÁREA DE TRABAJO */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Título de la Página */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-wide mb-1">Panel de Control</h1>
              <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
                LUN 15 JUN 2026 <span className="text-neutral-700 mx-1.5">•</span> SEMANA 24 <span className="text-neutral-700 mx-1.5">•</span> 6 SUCURSALES
              </p>
            </div>

            {/* Selector de Rango de Fecha */}
            <div className="bg-[#141416] p-1 border border-[#1F1F23] rounded-lg flex gap-1">
              <button className="text-[10px] font-bold px-3 py-1.5 bg-[#E8530A] text-white rounded-md tracking-wider transition-colors">
                HOY
              </button>
              <button className="text-[10px] font-bold px-3 py-1.5 text-neutral-400 hover:text-white rounded-md tracking-wider transition-colors">
                7 DÍAS
              </button>
              <button className="text-[10px] font-bold px-3 py-1.5 text-neutral-400 hover:text-white rounded-md tracking-wider transition-colors">
                30 DÍAS
              </button>
            </div>
          </div>

          {/* 4. CUADRÍCULA DE MÉTRICAS (METRICS GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tarjeta: Ventas */}
            <div className="bg-[#141416] border border-[#1F1F23] rounded-xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Ventas del Día</span>
                <div className="text-[#E8530A] bg-[#E8530A]/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.chart} size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  $47,832 <span className="text-xs font-bold text-neutral-500 ml-0.5">MXN</span>
                </h3>
                <div className="text-success text-xs font-bold flex items-center gap-1.5">
                  <span className="bg-success/10 px-1.5 py-0.5 rounded text-[10px]">↗ +18.4%</span>
                  <span className="text-neutral-500 font-medium text-[11px]">vs. ayer $40,390</span>
                </div>
              </div>
            </div>

            {/* Tarjeta: Pedidos Activos */}
            <div className="bg-[#141416] border border-[#1F1F23] rounded-xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Pedidos Activos</span>
                <div className="text-secondary bg-secondary/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.bag} size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  23 <span className="text-xs font-bold text-neutral-500 ml-0.5">EN CURSO</span>
                </h3>
                <div className="text-success text-xs font-bold flex items-center gap-1.5">
                  <span className="bg-success/10 px-1.5 py-0.5 rounded text-[10px]">↗ +5%</span>
                  <span className="text-neutral-500 font-medium text-[11px]">12 en cocina • 11 en camino</span>
                </div>
              </div>
            </div>

            {/* Tarjeta: Inventario Bajo */}
            <div className="bg-[#141416] border border-[#1F1F23] rounded-xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Inventario Bajo</span>
                <div className="text-destructive bg-destructive/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.box} size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  7 <span className="text-xs font-bold text-neutral-500 ml-0.5">PRODUCTOS</span>
                </h3>
                <div className="text-destructive text-xs font-bold flex items-center gap-1.5">
                  <span className="bg-destructive/10 px-1.5 py-0.5 rounded text-[10px]">↘ -2%</span>
                  <span className="text-neutral-400 font-bold text-[11px]">3 críticos</span>
                  <span className="text-neutral-500 font-medium text-[11px]"> 4 advertencia</span>
                </div>
              </div>
            </div>

            {/* Tarjeta: Sucursales Activas */}
            <div className="bg-[#141416] border border-[#1F1F23] rounded-xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Sucursales Activas</span>
                <div className="text-success bg-success/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Icon path={ICONS.store} size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  5 <span className="text-xs font-bold text-neutral-500 ml-0.5">DE 6</span>
                </h3>
                <div className="text-neutral-400 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-0.5 animate-pulse"></span>
                  Norte offline <span className="text-neutral-500">desde las 14:32</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sección de marcadores vacíos para futuras expansiones del dashboard */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-dashed border-[#1F1F23] rounded-xl h-64 flex items-center justify-center text-neutral-600 text-xs font-bold uppercase tracking-wider">
              Gráfico Principal de Ventas por Hora
            </div>
            <div className="border border-dashed border-[#1F1F23] rounded-xl h-64 flex items-center justify-center text-neutral-600 text-xs font-bold uppercase tracking-wider">
              Últimos Pedidos Recibidos
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}