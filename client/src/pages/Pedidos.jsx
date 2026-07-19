import React, { useState, useEffect } from 'react';
import { Icon, ICONS } from '../components/ui/Icon';
import { Toast } from '../components/ui/Toast';
import { getPedidos, updatePedidoStatus } from '../services/api';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setIsLoading(true);
      const data = await getPedidos();
      setPedidos(data || []);
    } catch (error) {
      showToast('Error al cargar los pedidos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      await updatePedidoStatus(id, newStatus);
      showToast(`Pedido actualizado a ${newStatus}.`, 'success');
      await fetchPedidos();
      if (selectedPedido && selectedPedido.id === id) {
        setSelectedPedido(prev => ({ ...prev, estado: newStatus }));
      }
    } catch (error) {
      showToast(error.message || 'Error al actualizar el estado.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetailsModal = (pedido) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'pendiente':
      case 'nuevo':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">Nuevo</span>;
      case 'preparando':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20">Preparando</span>;
      case 'listo':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20">Listo</span>;
      case 'entregado':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">Entregado</span>;
      case 'cancelado':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">Cancelado</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">{estado}</span>;
    }
  };

  return (
    <>
      <main className="flex-1 bg-[#0A0A0B] overflow-y-auto">
        <div className="p-8 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Icon path={ICONS.bag} size={28} className="text-[#E8530A]" />
                Gestión de Pedidos
              </h1>
              <p className="text-neutral-400 text-sm mt-1 font-bold">
                Visualiza y administra el historial completo de pedidos.
              </p>
            </div>
            <button
              onClick={fetchPedidos}
              disabled={isLoading}
              className="bg-[#1C1C1F] hover:bg-[#27272A] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-[#27272A]"
            >
              <Icon path={ICONS.refresh} size={20} className={isLoading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#141416] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-2xl relative">
            {isLoading ? (
              <div className="p-12 text-center text-neutral-500 font-bold flex flex-col items-center justify-center gap-4">
                <Icon path={ICONS.refresh} size={32} className="animate-spin" />
                Cargando pedidos...
              </div>
            ) : pedidos.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 font-bold">
                No hay pedidos registrados en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#09090A] text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-[#1F1F23]">
                      <th className="px-6 py-4 rounded-tl-2xl">ID Pedido</th>
                      <th className="px-6 py-4">Mesa</th>
                      <th className="px-6 py-4">Mesero</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold divide-y divide-[#1F1F23]/50">
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-white">#{pedido.id}</span>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            {pedido.tipo}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-300">
                          {pedido.mesa_numero ? `Mesa ${pedido.mesa_numero}` : 'Para llevar'}
                        </td>
                        <td className="px-6 py-4 text-neutral-400">
                          {pedido.mesero_nombre} {pedido.mesero_apellido}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(pedido.estado)}
                        </td>
                        <td className="px-6 py-4 text-[#E8530A]">
                          ${pedido.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 text-xs">
                          {new Date(pedido.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openDetailsModal(pedido)}
                            className="bg-[#1C1C1F] hover:bg-[#27272A] border border-[#27272A] text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Icon path={ICONS.eye} size={14} /> Detalles
                          </button>
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

      {/* Detalle Modal Glassmorphism */}
      {isModalOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  Pedido #{selectedPedido.id}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedPedido.estado)}
                  <span className="text-neutral-500 text-xs font-bold">
                    {new Date(selectedPedido.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-2"
              >
                <Icon path={ICONS.close} size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#141416] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Mesa</p>
                  <p className="text-white font-bold">{selectedPedido.mesa_numero || 'N/A'}</p>
                </div>
                <div className="bg-[#141416] p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Mesero</p>
                  <p className="text-white font-bold">{selectedPedido.mesero_nombre} {selectedPedido.mesero_apellido}</p>
                </div>
              </div>

              {selectedPedido.notas && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl mb-6">
                  <p className="text-[10px] text-primary uppercase tracking-widest font-black mb-1">Notas del Pedido</p>
                  <p className="text-white text-sm">{selectedPedido.notas}</p>
                </div>
              )}

              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Productos</h3>
              
              <div className="space-y-3">
                {selectedPedido.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#141416] border border-white/5 p-4 rounded-xl">
                    <div>
                      <p className="text-white font-bold text-sm">
                        <span className="text-primary mr-2">{item.cantidad}x</span> 
                        {item.producto_nombre}
                      </p>
                      {item.notas && (
                        <p className="text-neutral-500 text-xs italic mt-1">"{item.notas}"</p>
                      )}
                    </div>
                    <div className="text-right font-black text-white">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                <span className="text-sm font-black text-neutral-400 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-primary">${selectedPedido.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#09090A] shrink-0">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 text-center">Actualizar Estado</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  disabled={isUpdating || selectedPedido.estado === 'pendiente' || selectedPedido.estado === 'nuevo'}
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'nuevo')}
                  className="px-4 py-2 bg-[#1C1C1F] hover:bg-primary/20 text-white hover:text-primary rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-[#27272A] hover:border-primary/50"
                >
                  Nuevo
                </button>
                <button 
                  disabled={isUpdating || selectedPedido.estado === 'preparando'}
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'preparando')}
                  className="px-4 py-2 bg-[#1C1C1F] hover:bg-secondary/20 text-white hover:text-secondary rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-[#27272A] hover:border-secondary/50"
                >
                  Preparando
                </button>
                <button 
                  disabled={isUpdating || selectedPedido.estado === 'listo'}
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'listo')}
                  className="px-4 py-2 bg-[#1C1C1F] hover:bg-success/20 text-white hover:text-success rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-[#27272A] hover:border-success/50"
                >
                  Listo
                </button>
                <button 
                  disabled={isUpdating || selectedPedido.estado === 'entregado'}
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'entregado')}
                  className="px-4 py-2 bg-[#1C1C1F] hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-[#27272A] hover:border-white/20"
                >
                  Entregado
                </button>
                <button 
                  disabled={isUpdating || selectedPedido.estado === 'cancelado'}
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'cancelado')}
                  className="px-4 py-2 bg-[#1C1C1F] hover:bg-destructive/20 text-white hover:text-destructive rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-[#27272A] hover:border-destructive/50"
                >
                  Cancelar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

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
