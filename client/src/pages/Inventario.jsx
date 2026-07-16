import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getInitials, getUsuario, hasRole } from '../utils/auth';
import { getInventario, crearIngrediente, editarIngrediente, registrarEntrada, getMovimientos, registrarMerma, getTodosLosMovimientos } from '../services/api';

export default function Inventario() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventario, setInventario] = useState([]);
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  // Estados del modal para nuevo ingrediente (HU-42 / HU-43)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalNombre, setModalNombre] = useState('');
  const [modalCantidad, setModalCantidad] = useState('');
  const [modalUnidad, setModalUnidad] = useState('kg');
  const [modalStockMinimo, setModalStockMinimo] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Estados del modal para registrar entrada (HU-44)
  const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
  const [entradaId, setEntradaId] = useState(null);
  const [entradaNombre, setEntradaNombre] = useState('');
  const [entradaCantidad, setEntradaCantidad] = useState('');
  const [entradaProveedor, setEntradaProveedor] = useState('');
  const [entradaCosto, setEntradaCosto] = useState('');
  const [entradaError, setEntradaError] = useState('');
  const [entradaSubmitting, setEntradaSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados del modal de Merma (HU-48)
  const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
  const [mermaId, setMermaId] = useState(null);
  const [mermaNombre, setMermaNombre] = useState('');
  const [mermaCantidad, setMermaCantidad] = useState('');
  const [mermaMotivo, setMermaMotivo] = useState('');
  const [mermaError, setMermaError] = useState('');
  const [mermaSubmitting, setMermaSubmitting] = useState(false);

  // Estados del modal de Historial (HU-47)
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);
  const [historialId, setHistorialId] = useState(null);
  const [historialNombre, setHistorialNombre] = useState('');
  const [historialList, setHistorialList] = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialError, setHistorialError] = useState('');
  const [historialFiltroTipo, setHistorialFiltroTipo] = useState('');

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const loadInventario = async (stockBajoOnly) => {
    setLoading(true);
    setError('');
    try {
      const result = await getInventario(stockBajoOnly);
      setInventario(result.data || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventario(soloStockBajo);
  }, [soloStockBajo]);

  const handleCrearIngrediente = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSubmitting(true);
    try {
      const payload = {
        nombre: modalNombre.trim(),
        unidad: modalUnidad,
        stock_minimo: Number(modalStockMinimo),
      };

      if (isEditing) {
        await editarIngrediente(editingId, payload);
      } else {
        payload.cantidad_actual = Number(modalCantidad);
        await crearIngrediente(payload);
      }

      // Cerrar y limpiar formulario
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      setModalNombre('');
      setModalCantidad('');
      setModalUnidad('kg');
      setModalStockMinimo('');
      // Recargar listado
      loadInventario(soloStockBajo);
    } catch (err) {
      console.error('Error al guardar ingrediente:', err);
      setModalError(err.message || 'No se pudo guardar el ingrediente.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setModalNombre(item.nombre);
    setModalCantidad(item.cantidad_actual.toString());
    setModalUnidad(item.unidad);
    setModalStockMinimo(item.stock_minimo.toString());
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEntradaModal = (item) => {
    setEntradaId(item.id);
    setEntradaNombre(item.nombre);
    setEntradaCantidad('');
    setEntradaProveedor('');
    setEntradaCosto('');
    setEntradaError('');
    setIsEntradaModalOpen(true);
  };

  const handleSaveEntrada = async (e) => {
    e.preventDefault();
    setEntradaError('');
    setEntradaSubmitting(true);
    try {
      const payload = {
        cantidad: Number(entradaCantidad),
        proveedor: entradaProveedor.trim() || undefined,
        costo_unitario: entradaCosto !== '' ? Number(entradaCosto) : undefined,
      };

      await registrarEntrada(entradaId, payload);
      
      setSuccessMessage(`¡Entrada registrada con éxito para ${entradaNombre}!`);
      setTimeout(() => setSuccessMessage(''), 4000);

      setIsEntradaModalOpen(false);
      setEntradaId(null);
      setEntradaNombre('');
      setEntradaCantidad('');
      setEntradaProveedor('');
      setEntradaCosto('');
      
      loadInventario(soloStockBajo);
    } catch (err) {
      console.error('Error al registrar entrada:', err);
      setEntradaError(err.message || 'No se pudo registrar la entrada.');
    } finally {
      setEntradaSubmitting(false);
    }
  };

  const handleOpenMermaModal = (item) => {
    setMermaId(item.id);
    setMermaNombre(item.nombre);
    setMermaCantidad('');
    setMermaMotivo('');
    setMermaError('');
    setIsMermaModalOpen(true);
  };

  const handleSaveMerma = async (e) => {
    e.preventDefault();
    setMermaError('');
    setMermaSubmitting(true);
    try {
      const payload = {
        cantidad: Number(mermaCantidad),
        motivo: mermaMotivo.trim(),
      };

      await registrarMerma(mermaId, payload);
      
      setSuccessMessage(`¡Merma registrada con éxito para ${mermaNombre}!`);
      setTimeout(() => setSuccessMessage(''), 4000);

      setIsMermaModalOpen(false);
      setMermaId(null);
      setMermaNombre('');
      setMermaCantidad('');
      setMermaMotivo('');
      
      loadInventario(soloStockBajo);
    } catch (err) {
      console.error('Error al registrar merma:', err);
      setMermaError(err.message || 'No se pudo registrar la merma.');
    } finally {
      setMermaSubmitting(false);
    }
  };

  const loadHistorial = async (tipo) => {
    setHistorialLoading(true);
    setHistorialError('');
    try {
      const res = await getTodosLosMovimientos(tipo);
      setHistorialList(res.data || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setHistorialError(err.message || 'No se pudo cargar el historial.');
    } finally {
      setHistorialLoading(false);
    }
  };

  const handleOpenHistorialModal = () => {
    setHistorialId(null);
    setHistorialNombre('General');
    setHistorialFiltroTipo('');
    setIsHistorialModalOpen(true);
    loadHistorial('');
  };

  useEffect(() => {
    if (isHistorialModalOpen) {
      loadHistorial(historialFiltroTipo);
    }
  }, [historialFiltroTipo]);

  const displayInventario = [...inventario].sort((a, b) => {
    if (soloStockBajo) {
      const ratioA = a.stock_minimo === 0 ? 0 : a.cantidad_actual / a.stock_minimo;
      const ratioB = b.stock_minimo === 0 ? 0 : b.cantidad_actual / b.stock_minimo;
      return ratioA - ratioB;
    }
    return 0;
  });

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
                className="flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141416] rounded-lg text-sm font-medium transition-colors"
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
                className="flex items-center justify-between px-3 py-2.5 bg-[#141416] rounded-lg border-l-2 border-[#E8530A] text-[#E8530A] font-bold text-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon path={ICONS.box} size={18} />
                  <span>Inventario</span>
                </div>
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
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> ONLINE
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>CPU - Carga del sistema</span>
              <span className="font-bold">24%</span>
            </div>
            <div className="w-full bg-[#1F1F23] h-1.5 rounded-full overflow-hidden">
              <div className="bg-success h-full w-[24%] rounded-full"></div>
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
            A LA BURGER OS <span className="text-neutral-600 mx-1">/</span> <span className="text-white">Inventario</span>
          </div>

          {/* Controles de Usuario */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight">{usuario?.nombre || 'Usuario'}</p>
                <p className="text-[10px] text-[#E8530A] font-black tracking-wider uppercase">{usuario?.rol || 'Sin rol'}</p>
              </div>
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-[#E8530A] font-bold text-xs flex items-center justify-center shadow-lg border border-[#E8530A]/30"
              >
                {getInitials(usuario?.nombre)}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 hover:text-white border border-[#1F1F23] hover:border-neutral-600 bg-[#141416] px-3 py-1.5 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* 3. ÁREA DE TRABAJO */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Título de la Página */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-wide mb-1">Inventario de Ingredientes</h1>
              <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
                Consulta y control de existencias de materia prima
              </p>
            </div>

            {/* Controles de Inventario: Filtro y Botón de Creación para Administradores */}
            <div className="flex items-center gap-4">
              {hasRole(['administrador']) && (
                <>
                  <button
                    type="button"
                    onClick={handleOpenHistorialModal}
                    className="flex items-center gap-2 bg-[#141416] hover:bg-[#1F1F23] text-neutral-300 border border-[#1F1F23] hover:border-neutral-600 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Historial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setModalNombre('');
                    setModalCantidad('');
                    setModalUnidad('kg');
                    setModalStockMinimo('');
                    setModalError('');
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#E8530A] hover:bg-[#ff6214] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  + Agregar ingrediente
                </button>
              )}

              <label className="flex items-center gap-3 cursor-pointer group bg-[#141416] border border-[#1F1F23] px-4 py-2.5 rounded-lg hover:border-neutral-800 transition-colors">
                <input
                  type="checkbox"
                  checked={soloStockBajo}
                  onChange={(e) => setSoloStockBajo(e.target.checked)}
                  className="accent-[#E8530A] h-4 w-4 cursor-pointer"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-white transition-colors">
                  Solo stock bajo
                </span>
              </label>
            </div>
          </div>

          {/* Banner de error */}
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3 text-destructive">
               <div className="text-destructive font-bold text-lg">⚠️</div>
               <div className="text-xs font-bold uppercase tracking-wider">{error}</div>
            </div>
          )}

          {/* Banner de éxito */}
          {successMessage && (
            <div className="mb-6 bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3 text-success">
               <div className="text-success font-bold text-lg">✅</div>
               <div className="text-xs font-bold uppercase tracking-wider">{successMessage}</div>
            </div>
          )}

          {/* Tabla de inventario */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary"></div>
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Cargando ingredientes...</p>
            </div>
          ) : inventario.length === 0 ? (
            <div className="border border-dashed border-[#1F1F23] rounded-xl py-16 flex flex-col items-center justify-center text-center text-neutral-500">
              <span className="text-4xl mb-3">📦</span>
              <p className="text-sm font-bold uppercase tracking-wider mb-1">Sin ingredientes registrados</p>
              <p className="text-xs text-neutral-600">No se encontraron materias primas en el almacén</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#141416] border border-[#1F1F23] rounded-xl shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F1F23] text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-[#09090A]">
                    <th className="p-4 pl-6">Ingrediente</th>
                    <th className="p-4 text-right">Cantidad Actual</th>
                    <th className="p-4">Unidad</th>
                    <th className="p-4 text-right">Stock Mínimo</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 pr-6">Última Actualización</th>
                    {hasRole(['administrador', 'cocina']) && <th className="p-4 text-center pr-6">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F23] text-sm">
                  {displayInventario.map((item) => {
                    const isLowStock = item.cantidad_actual <= item.stock_minimo;
                    return (
                      <tr 
                        key={item.id} 
                        className={`group hover:bg-[#1C1C1E] transition-colors border-l-2 ${
                          isLowStock ? 'border-destructive bg-destructive/5 text-neutral-200' : 'border-transparent text-neutral-300'
                        }`}
                      >
                        <td className="p-4 pl-6 font-bold tracking-wide uppercase text-xs">
                          {item.nombre}
                        </td>
                        <td className={`p-4 text-right font-black text-sm ${isLowStock ? 'text-destructive' : 'text-success'}`}>
                          {item.cantidad_actual}
                        </td>
                        <td className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          {item.unidad}
                        </td>
                        <td className="p-4 text-right font-bold text-xs text-neutral-400">
                          {item.stock_minimo}
                        </td>
                        <td className="p-4 text-center">
                          {isLowStock ? (
                            <span className="inline-block bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Bajo Stock
                            </span>
                          ) : (
                            <span className="inline-block bg-success/10 text-success border border-success/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                              Suficiente
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-xs text-neutral-500 font-medium">
                          {item.ultima_actualizacion
                            ? new Date(item.ultima_actualizacion).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Sin registro'}
                        </td>
                        {hasRole(['administrador', 'cocina']) && (
                          <td className="p-4 text-center pr-6">
                            <div className="flex items-center justify-center gap-2">
                              {hasRole(['administrador']) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEntradaModal(item)}
                                    className="text-[10px] font-black bg-[#E8530A]/10 hover:bg-[#E8530A]/25 text-[#E8530A] border border-[#E8530A]/20 hover:border-[#E8530A]/40 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                                  >
                                    Entrada
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="text-[10px] font-black bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-[#1F1F23] hover:border-neutral-600 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                                  >
                                    Editar
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenMermaModal(item)}
                                className="text-[10px] font-black bg-destructive/10 hover:bg-destructive/25 text-destructive border border-destructive/20 hover:border-destructive/40 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                              >
                                Merma
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE INGREDIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 transition-all">
          <div className="bg-[#09090A] border border-[#1F1F23] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between">
              <h3 className="font-black tracking-wide text-lg text-white uppercase">
                {isEditing ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setModalError('');
                  setModalNombre('');
                  setModalCantidad('');
                  setModalUnidad('kg');
                  setModalStockMinimo('');
                }}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearIngrediente} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs font-bold text-destructive uppercase tracking-wide">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Nombre del ingrediente
                </label>
                <input
                  type="text"
                  required
                  value={modalNombre}
                  onChange={(e) => setModalNombre(e.target.value)}
                  placeholder="Ej. Carne de Res, Queso Cheddar"
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cantidad */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                    {isEditing ? 'Cantidad Actual' : 'Cantidad Inicial'}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    min="0"
                    readOnly={isEditing}
                    value={modalCantidad}
                    onChange={(e) => setModalCantidad(e.target.value)}
                    placeholder="0"
                    className={`w-full border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
                      isEditing ? 'bg-[#0E0E10] text-neutral-500 cursor-not-allowed border-dashed' : 'bg-[#141416]'
                    }`}
                  />
                  {isEditing && (
                    <p className="text-[9px] font-semibold text-neutral-500 leading-tight mt-1">
                      Ajustable solo vía movimientos
                    </p>
                  )}
                </div>

                {/* Unidad */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                    Unidad de Medida
                  </label>
                  <select
                    value={modalUnidad}
                    onChange={(e) => setModalUnidad(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="kg">kg (Kilogramo)</option>
                    <option value="g">g (Gramo)</option>
                    <option value="l">l (Litro)</option>
                    <option value="ml">ml (Mililitro)</option>
                    <option value="pza">pza (Pieza)</option>
                  </select>
                </div>
              </div>

              {/* Stock Mínimo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Stock Mínimo (Alerta)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  min="0"
                  value={modalStockMinimo}
                  onChange={(e) => setModalStockMinimo(e.target.value)}
                  placeholder="Ej. 5"
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setModalError('');
                    setModalNombre('');
                    setModalCantidad('');
                    setModalUnidad('kg');
                    setModalStockMinimo('');
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-4 py-2.5 rounded-lg border border-[#1F1F23] bg-[#141416] hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="text-xs font-bold uppercase tracking-wider text-white bg-[#E8530A] hover:bg-[#ff6214] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {modalSubmitting ? (isEditing ? 'Guardando...' : 'Registrando...') : (isEditing ? 'Guardar' : 'Registrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRAR ENTRADA */}
      {isEntradaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 transition-all">
          <div className="bg-[#09090A] border border-[#1F1F23] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between">
              <h3 className="font-black tracking-wide text-lg text-white uppercase">
                Registrar Entrada: {entradaNombre}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsEntradaModalOpen(false);
                  setEntradaError('');
                }}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEntrada} className="p-6 space-y-4">
              {entradaError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs font-bold text-destructive uppercase tracking-wide">
                  ⚠️ {entradaError}
                </div>
              )}

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Cantidad a agregar (Requerido)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  min="0.001"
                  value={entradaCantidad}
                  onChange={(e) => setEntradaCantidad(e.target.value)}
                  placeholder="Ej. 10"
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {/* Proveedor */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Proveedor / Referencia (Opcional)
                </label>
                <input
                  type="text"
                  value={entradaProveedor}
                  onChange={(e) => setEntradaProveedor(e.target.value)}
                  placeholder="Ej. Distribuidora San Juan"
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {/* Costo Unitario */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Costo Unitario (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entradaCosto}
                    onChange={(e) => setEntradaCosto(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEntradaModalOpen(false);
                    setEntradaError('');
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-4 py-2.5 rounded-lg border border-[#1F1F23] bg-[#141416] hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={entradaSubmitting}
                  className="text-xs font-bold uppercase tracking-wider text-white bg-[#E8530A] hover:bg-[#ff6214] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {entradaSubmitting ? 'Guardando...' : 'Registrar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE REGISTRAR MERMA */}
      {isMermaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 transition-all">
          <div className="bg-[#09090A] border border-[#1F1F23] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#1F1F23] flex items-center justify-between">
              <h3 className="font-black tracking-wide text-lg text-white uppercase">
                Registrar Merma: {mermaNombre}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsMermaModalOpen(false);
                  setMermaError('');
                }}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveMerma} className="p-6 space-y-4">
              {mermaError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs font-bold text-destructive uppercase tracking-wide">
                  ⚠️ {mermaError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Cantidad a mermar (Requerido)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  min="0.001"
                  value={mermaCantidad}
                  onChange={(e) => setMermaCantidad(e.target.value)}
                  placeholder="Ej. 2"
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Motivo de la merma (Requerido)
                </label>
                <input
                  type="text"
                  required
                  value={mermaMotivo}
                  onChange={(e) => setMermaMotivo(e.target.value)}
                  placeholder="Ej. Daño físico, Caducidad..."
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMermaModalOpen(false);
                    setMermaError('');
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-4 py-2.5 rounded-lg border border-[#1F1F23] bg-[#141416] hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mermaSubmitting}
                  className="text-xs font-bold uppercase tracking-wider text-white bg-[#E8530A] hover:bg-[#ff6214] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {mermaSubmitting ? 'Guardando...' : 'Registrar Merma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE MOVIMIENTOS */}
      {isHistorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 transition-all">
          <div className="bg-[#09090A] border border-[#1F1F23] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <h3 className="font-black tracking-wide text-lg text-white uppercase">
                Historial: {historialNombre}
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={historialFiltroTipo}
                  onChange={(e) => setHistorialFiltroTipo(e.target.value)}
                  className="bg-[#141416] border border-[#1F1F23] focus:border-primary text-neutral-200 rounded-lg px-3 py-1.5 text-xs font-bold uppercase outline-none transition-colors cursor-pointer"
                >
                  <option value="">Todos los tipos</option>
                  <option value="entrada">Entradas</option>
                  <option value="salida">Salidas</option>
                  <option value="merma">Mermas</option>
                  <option value="ajuste">Ajustes</option>
                </select>
                <button 
                  type="button"
                  onClick={() => setIsHistorialModalOpen(false)}
                  className="text-neutral-500 hover:text-white transition-colors cursor-pointer px-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {historialError && (
                <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs font-bold text-destructive uppercase tracking-wide">
                  ⚠️ {historialError}
                </div>
              )}
              {historialLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-500 gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-primary"></div>
                  <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Cargando...</p>
                </div>
              ) : historialList.length === 0 ? (
                <div className="border border-dashed border-[#1F1F23] rounded-xl py-10 flex flex-col items-center justify-center text-center text-neutral-500">
                  <span className="text-2xl mb-2">📊</span>
                  <p className="text-xs font-bold uppercase tracking-wider">Sin movimientos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-[#141416] border border-[#1F1F23] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1F1F23] text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-[#09090A]">
                        <th className="p-3 pl-4">Fecha</th>
                        <th className="p-3">Ingrediente</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-right">Cantidad</th>
                        <th className="p-3 pr-4">Motivo / Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F23] text-xs">
                      {historialList.map((mov) => {
                        let rowClass = 'text-neutral-300';
                        if (mov.tipo === 'entrada') rowClass = 'text-success bg-success/5';
                        else if (mov.tipo === 'salida' || mov.tipo === 'merma') rowClass = 'text-destructive bg-destructive/5';
                        
                        return (
                          <tr key={mov.id} className={`hover:bg-[#1C1C1E] transition-colors ${rowClass}`}>
                            <td className="p-3 pl-4 font-medium text-neutral-400">
                              {new Date(mov.fecha).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td className="p-3 font-bold uppercase tracking-wider text-white">
                              {mov.ingrediente_nombre}
                            </td>
                            <td className="p-3 font-bold uppercase tracking-wider">
                              {mov.tipo}
                            </td>
                            <td className="p-3 text-right font-black">
                              {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                            </td>
                            <td className="p-3 pr-4 text-neutral-400">
                              {mov.motivo || mov.referencia || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
