import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { getUsuario, clearAuth } from '../utils/auth';
import { getPedidos, updatePedidoStatus } from '../services/api';
import { Toast } from '../components/ui/Toast';

export default function KDS() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [now, setNow] = useState(new Date());

  const fetchPedidos = async () => {
    try {
      const data = await getPedidos();
      // Filtrar solo pedidos que le importan a la cocina
      const cocinaPedidos = data.filter(p => p.estado === 'pendiente' || p.estado === 'preparando');
      // Ordenar por fecha de creación ascendente (los más viejos primero)
      cocinaPedidos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setPedidos(cocinaPedidos);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const fetchInterval = setInterval(fetchPedidos, 10000); // Polling cada 10s
    const timeInterval = setInterval(() => setNow(new Date()), 10000); // Update timer cada 10s
    return () => {
      clearInterval(fetchInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await updatePedidoStatus(id, newStatus);
      setToast({ message: `Pedido #${id} marcado como ${newStatus}`, type: 'success' });
      await fetchPedidos();
    } catch (err) {
      setToast({ message: err.message || 'Error al actualizar el estado', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const getElapsedMinutes = (dateString) => {
    const start = new Date(dateString);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? `${diffMins}m` : '<1m';
  };

  // Helper para parsear el texto de las notas en "modificaciones"
  const parseNotesToMods = (notasText) => {
    if (!notasText) return [];
    
    // Separamos por comas o saltos de línea (asumiendo que los meseros escriben así)
    const rawMods = notasText.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
    
    return rawMods.map(text => {
      const upper = text.toUpperCase();
      let type = 'add'; // por defecto
      if (upper.includes('SIN ') || upper.includes('NO ')) type = 'remove';
      else if (upper.includes('EXTRA ')) type = 'extra';
      
      return { type, text: upper };
    });
  };

  const getModColor = (type) => {
    if (type === 'remove') return 'border-destructive text-destructive bg-destructive/10';
    if (type === 'add') return 'border-secondary text-secondary bg-secondary/10';
    return 'border-success text-success bg-success/10'; // extra
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header Cocina */}
      <header className="flex justify-between items-center mb-8 border-b border-[#1E1E1E] pb-4">
        <div className="flex items-center gap-4">
          <Link to={usuario?.rol === 'administrador' ? '/' : '/cocina'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs">A</div>
            <h1 className="font-bold tracking-widest text-sm uppercase text-white">Burger OS <span className="text-muted-foreground ml-2">/ KDS Cocina</span></h1>
          </Link>
          {usuario?.rol === 'administrador' && (
            <Link to="/" className="text-xs bg-[#1E1E1E] hover:bg-neutral-800 border border-[#2A2A2F] text-neutral-300 font-bold px-3 py-1.5 rounded-lg transition-colors ml-2">
              Volver al Panel
            </Link>
          )}
        </div>
        <div className="flex gap-4 text-xs font-bold tracking-wider items-center">
          <span className="text-muted-foreground hidden md:inline">MODIFICACIONES:</span>
          <span className="text-destructive items-center gap-1 hidden sm:flex"><div className="w-2 h-2 border border-destructive"></div> ELIMINAR</span>
          <span className="text-secondary items-center gap-1 hidden sm:flex"><div className="w-2 h-2 border border-secondary"></div> AGREGAR</span>
          <span className="text-success items-center gap-1 hidden sm:flex"><div className="w-2 h-2 border border-success"></div> EXTRA</span>
          
          <button 
            onClick={() => { clearAuth(); navigate('/login'); }}
            className="text-xs text-destructive hover:text-white bg-destructive/10 hover:bg-destructive font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider ml-4"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Loading / Error States */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground font-bold tracking-widest">
          CARGANDO PEDIDOS...
        </div>
      ) : error ? (
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-lg text-center font-bold">
          {error}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-bold tracking-widest border border-dashed border-[#2A2A2F] rounded-xl">
          NO HAY PEDIDOS ACTIVOS EN LA COCINA
        </div>
      ) : (
        /* Grid de Comandas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pedidos.map((order) => {
            const timeClass = order.estado === 'preparando' ? 'text-primary' : 'text-success';
            return (
              <div key={order.id} className="bg-card border border-[#1E1E1E] rounded-xl p-5 flex flex-col h-full shadow-lg">
                {/* Cabecera de la comanda */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-black">#{order.id}</h2>
                  <span className="bg-[#1E1E1E] text-muted-foreground text-xs font-bold px-2 py-1 rounded tracking-widest uppercase">
                    {order.mesa_numero ? `MESA ${order.mesa_numero}` : 'LLEVAR'}
                  </span>
                </div>
                
                <div className={`flex items-center gap-1 mb-6 font-bold ${timeClass}`}>
                   <Icon path={ICONS.clock} size={14} />
                   {getElapsedMinutes(order.created_at)} <span className="text-muted-foreground text-xs ml-1 font-normal">transcurrido</span>
                </div>

                {/* Items */}
                <div className="flex-1 space-y-5">
                  {order.items.map((item, idx) => {
                    const mods = parseNotesToMods(item.notas);
                    return (
                      <div key={idx}>
                        <p className="font-bold uppercase tracking-wide text-sm mb-2">
                          {item.producto_nombre} ×{item.cantidad}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mods.map((mod, midx) => (
                            <span key={midx} className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${getModColor(mod.type)}`}>
                              {mod.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botones de acción */}
                <div className="mt-6 pt-4 border-t border-[#1E1E1E]">
                  {order.estado === 'preparando' ? (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'listo')}
                      disabled={processingId === order.id}
                      className="w-full bg-success/20 hover:bg-success/30 text-success border border-success font-bold py-3 rounded-lg flex items-center justify-center gap-2 tracking-widest text-sm transition-colors disabled:opacity-50"
                    >
                      {processingId === order.id ? 'PROCESANDO...' : (
                        <>LISTO <Icon path={ICONS.check} size={16} /></>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-center text-primary text-xs font-bold tracking-widest mb-2">NUEVO</div>
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'preparando')}
                        disabled={processingId === order.id}
                        className="w-full bg-primary hover:bg-[#c94508] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 tracking-widest text-sm transition-colors disabled:opacity-50"
                      >
                        {processingId === order.id ? 'PROCESANDO...' : (
                          <><Icon path={ICONS.chef} size={16} /> PREPARAR</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}