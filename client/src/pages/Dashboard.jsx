import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getInitials, getUsuario } from '../utils/auth';
import { getAlertasStockBajo } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [alertCount, setAlertCount] = useState(0);
  const [alertItems, setAlertItems] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAlerts() {
      try {
        const result = await getAlertasStockBajo();
        if (active) {
          setAlertCount(result.total || 0);
          setAlertItems(result.data || []);
        }
      } catch (error) {
        console.error('Error al cargar alertas de stock bajo:', error);
      } finally {
        if (active) {
          setLoadingAlerts(false);
        }
      }
    }
    loadAlerts();
    return () => {
      active = false;
    };
  }, []);

  const criticos = alertItems.filter(item => item.cantidad_actual === 0 || item.stock_minimo === 0 || (item.cantidad_actual / item.stock_minimo) <= 0.5).length;
  const advertencias = alertCount - criticos;

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
  return (
    <>
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
                  {loadingAlerts ? '...' : alertCount} <span className="text-xs font-bold text-neutral-500 ml-0.5">PRODUCTOS</span>
                </h3>
                <div className="text-destructive text-xs font-bold flex items-center gap-1.5">
                  <span className="bg-destructive/10 px-1.5 py-0.5 rounded text-[10px]">↘ ALERTA</span>
                  <span className="text-neutral-400 font-bold text-[11px]">{criticos} críticos</span>
                  <span className="text-neutral-500 font-medium text-[11px]">{advertencias} {advertencias === 1 ? 'advertencia' : 'advertencias'}</span>
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
    </>
  );
}