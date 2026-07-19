import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { getUsuario, clearAuth } from '../utils/auth';
import { getPedidos, updatePedidoStatus } from '../services/api';
import { Toast } from '../components/ui/Toast';

export default function CajaApp() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000); // Polling cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await updatePedidoStatus(id, newStatus);
      setToast({ message: `Pedido #${id} marcado como ${newStatus}`, type: 'success' });
      await fetchPedidos();
    } catch (err) {
      setToast({ message: err.message || 'No se pudo actualizar el pedido.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filtrar pedidos que no estén 'pagado' o 'cancelado' (o según las reglas del negocio)
  // Para la caja, es útil ver todos los activos, especialmente 'listo' y 'pendiente'.
  const activos = pedidos.filter(p => !['pagado', 'cancelado'].includes(p.estado));
  
  // Total de ventas del día (basado en los pagados hoy, para métricas rápidas)
  const ventasHoy = pedidos
    .filter(p => p.estado === 'pagado')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'listo': return 'bg-success/20 text-success border-success';
      case 'preparando': return 'bg-primary/20 text-primary border-primary';
      case 'pendiente': return 'bg-secondary/20 text-secondary border-secondary';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Caja */}
      <header className="flex justify-between items-center p-6 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-4">
          <Link to={usuario?.rol === 'administrador' ? '/' : '/caja'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-white font-bold w-8 h-8 rounded flex items-center justify-center text-sm">C</div>
            <h1 className="font-bold tracking-widest text-lg uppercase text-white">Burger OS <span className="text-muted-foreground ml-2">/ Caja Central</span></h1>
          </Link>
          {usuario?.rol === 'administrador' && (
            <Link to="/" className="text-xs bg-[#1E1E1E] hover:bg-neutral-800 border border-[#2A2A2F] text-neutral-300 font-bold px-3 py-1.5 rounded-lg transition-colors ml-2 uppercase tracking-wider">
              Volver al Panel
            </Link>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mb-1">Corte Actual</p>
            <p className="text-success font-black text-xl leading-none">${ventasHoy.toFixed(2)}</p>
          </div>
          <div className="h-8 w-px bg-[#1E1E1E] hidden sm:block"></div>
          <button 
            onClick={() => { clearAuth(); navigate('/login'); }}
            className="text-xs text-destructive hover:text-white bg-destructive/10 hover:bg-destructive font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Pedidos Activos</h2>
            <p className="text-sm text-muted-foreground mt-1">Selecciona un pedido para registrar el pago o actualizar su estado.</p>
          </div>
          <button 
            onClick={fetchPedidos}
            className="text-xs bg-card hover:bg-[#1E1E1E] border border-[#1E1E1E] text-white font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider flex items-center gap-2"
          >
            <Icon path={ICONS.refresh} size={14} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl text-center font-bold">
            {error}
          </div>
        ) : activos.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#1E1E1E] rounded-2xl">
            <Icon path={ICONS.check} size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-neutral-400 uppercase tracking-widest">Todo al día</h3>
            <p className="text-sm text-neutral-600 mt-2">No hay pedidos pendientes de cobro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {activos.map(pedido => (
              <div key={pedido.id} className="bg-card border border-[#1E1E1E] rounded-2xl p-6 flex flex-col shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${pedido.estado === 'listo' ? 'bg-success' : 'bg-primary'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black leading-none">#{pedido.id}</h3>
                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                      {pedido.mesa_numero ? `Mesa ${pedido.mesa_numero}` : 'Mostrador'}
                    </p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusStyle(pedido.estado)}`}>
                    {pedido.estado}
                  </div>
                </div>

                <div className="flex-1 mt-2 mb-6">
                  <div className="space-y-3">
                    {pedido.items && pedido.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-center border-b border-[#1E1E1E] pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-neutral-300">
                          <span className="text-primary mr-2">{item.cantidad}x</span> 
                          {item.producto_nombre}
                        </span>
                        <span className="text-neutral-500 font-semibold">${item.precio_unitario.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1E1E1E]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-white">${pedido.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(pedido.id, 'pagado')}
                      disabled={processingId === pedido.id}
                      className="flex-1 bg-success hover:bg-green-600 text-white text-xs font-black py-3 rounded-xl transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === pedido.id ? '...' : (
                        <>
                          <Icon path={ICONS.check} size={16} /> Cobrar
                        </>
                      )}
                    </button>
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => handleUpdateStatus(pedido.id, 'cancelado')}
                        disabled={processingId === pedido.id}
                        className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/30 hover:border-destructive text-xs font-black p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancelar Pedido"
                      >
                        <Icon path={ICONS.trash} size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
