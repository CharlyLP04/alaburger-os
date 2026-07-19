import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getUsuario } from '../utils/auth';
import { getAlertasStockBajo, getDashboardMetrics } from '../services/api';
import { Toast } from '../components/ui/Toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  // Metrics State
  const [metrics, setMetrics] = useState({
    ventasDelDia: 0,
    crecimientoVentas: 0,
    pedidosActivos: 0,
    ticketPromedio: 0,
    ultimosPedidos: []
  });
  
  // Alerts State
  const [alertCount, setAlertCount] = useState(0);
  const [alertItems, setAlertItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        // Load Metrics and Alerts concurrently
        const [metricsData, alertsData] = await Promise.all([
          getDashboardMetrics(),
          getAlertasStockBajo()
        ]);
        
        if (active) {
          setMetrics(metricsData);
          setAlertCount(alertsData.total || 0);
          setAlertItems(alertsData.data || []);
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        if (active) showToast('Error al cargar los datos en vivo.', 'error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const criticos = alertItems.filter(item => item.cantidad_actual === 0 || item.stock_minimo === 0 || (item.cantidad_actual / item.stock_minimo) <= 0.5).length;
  const advertencias = alertCount - criticos;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'pendiente':
      case 'nuevo':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">Nuevo</span>;
      case 'en_preparacion':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">Preparando</span>;
      case 'listo':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20">Listo</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">{estado}</span>;
    }
  };

  // Date formatting for the header
  const today = new Date();
  const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('es-MX', dateOptions).toUpperCase().replace('.', '');
  // Week number approximation
  const startDate = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today - startDate) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil(days / 7);

  return (
    <>
      <main className="flex-1 p-8 overflow-y-auto bg-[#0A0A0B] relative">
        {/* Decorative Glows for Aesthetics */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto pb-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                <Icon path={ICONS.dashboard} size={32} className="text-primary" />
                Panel de Control
              </h1>
              <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase flex items-center gap-2">
                <Icon path={ICONS.calendar} size={14} />
                {formattedDate} 
                <span className="text-neutral-700 font-black">•</span> SEMANA {weekNumber}
              </p>
            </div>
            
            <div className="bg-[#141416]/80 backdrop-blur-md p-1.5 border border-white/5 rounded-xl flex gap-1 shadow-lg">
              <button className="text-[10px] font-black px-4 py-2 bg-primary text-white rounded-lg tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(232,83,10,0.4)]">
                Hoy
              </button>
              <button className="text-[10px] font-black px-4 py-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg tracking-widest uppercase transition-all">
                7 Días
              </button>
              <button className="text-[10px] font-black px-4 py-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg tracking-widest uppercase transition-all">
                30 Días
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Ventas Card */}
            <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Ventas del Día</span>
                <div className="text-primary bg-primary/10 border border-primary/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon path={ICONS.chart} size={18} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 flex items-baseline gap-1">
                  {loading ? '...' : formatCurrency(metrics.ventasDelDia).split('.')[0]}
                  <span className="text-sm font-bold text-neutral-500">
                    .{loading ? '00' : formatCurrency(metrics.ventasDelDia).split('.')[1]} MXN
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${metrics.crecimientoVentas >= 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    {metrics.crecimientoVentas >= 0 ? '↗' : '↘'} {Math.abs(metrics.crecimientoVentas).toFixed(1)}%
                  </span>
                  <span className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">vs. ayer {formatCurrency(metrics.ventasAyer)}</span>
                </div>
              </div>
            </div>

            {/* Pedidos Activos */}
            <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-secondary/50 transition-all group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-secondary/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Pedidos Activos</span>
                <div className="text-secondary bg-secondary/10 border border-secondary/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon path={ICONS.bag} size={18} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2">
                  {loading ? '...' : metrics.pedidosActivos} 
                  <span className="text-[10px] font-black text-secondary tracking-widest uppercase bg-secondary/10 px-2 py-1 rounded border border-secondary/20">En Curso</span>
                </h3>
                <p className="text-neutral-500 font-bold text-[11px] uppercase tracking-wider mt-1.5">
                  Esperando atención en cocina
                </p>
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-info/50 transition-all group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-info/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-info/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Ticket Promedio</span>
                <div className="text-info bg-info/10 border border-info/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon path={ICONS.users} size={18} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 flex items-baseline gap-1">
                  {loading ? '...' : formatCurrency(metrics.ticketPromedio).split('.')[0]}
                  <span className="text-sm font-bold text-neutral-500">
                    .{loading ? '00' : formatCurrency(metrics.ticketPromedio).split('.')[1]} MXN
                  </span>
                </h3>
                <p className="text-neutral-500 font-bold text-[11px] uppercase tracking-wider mt-1.5">
                  Promedio de gasto por orden
                </p>
              </div>
            </div>

            {/* Inventario Bajo */}
            <Link to="/inventario" className="bg-[#141416]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-destructive/50 transition-all group shadow-xl relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-destructive/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Inventario Bajo</span>
                <div className="text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon path={ICONS.box} size={18} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2">
                  {loading ? '...' : alertCount} 
                  <span className="text-xs font-bold text-neutral-500 ml-0.5">INSUMOS</span>
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {criticos > 0 && (
                    <span className="bg-destructive/20 text-destructive border border-destructive/30 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
                      {criticos} críticos
                    </span>
                  )}
                  {advertencias > 0 && (
                    <span className="text-warning font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                      • {advertencias} {advertencias === 1 ? 'advertencia' : 'advertencias'}
                    </span>
                  )}
                  {alertCount === 0 && (
                    <span className="text-success font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Icon path={ICONS.check} size={12} /> Stock Saludable
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Recents Section */}
          <div className="bg-[#141416]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Icon path={ICONS.clock} size={16} className="text-neutral-500" />
                Últimos Pedidos
              </h2>
              <Link to="/pedidos" className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20">
                Ver todos <Icon path={ICONS.arrowRight} size={12} />
              </Link>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-neutral-500 font-bold flex flex-col items-center justify-center gap-3">
                <Icon path={ICONS.refresh} size={24} className="animate-spin" />
                Cargando recientes...
              </div>
            ) : metrics.ultimosPedidos.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 font-bold">
                No hay pedidos en el día de hoy.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-neutral-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                      <th className="px-4 py-3 rounded-tl-xl">ID</th>
                      <th className="px-4 py-3">Mesero</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 text-right rounded-tr-xl">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold divide-y divide-white/5">
                    {metrics.ultimosPedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-white">#{pedido.id}</td>
                        <td className="px-4 py-3 text-neutral-400">{pedido.mesero || 'Desconocido'}</td>
                        <td className="px-4 py-3">{getStatusBadge(pedido.estado)}</td>
                        <td className="px-4 py-3 text-primary">{formatCurrency(pedido.total)}</td>
                        <td className="px-4 py-3 text-right text-neutral-500 text-xs">
                          {new Date(pedido.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}