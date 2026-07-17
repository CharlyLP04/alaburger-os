import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getInitials, getUsuario, hasRole } from '../utils/auth';
import { getInventario, crearIngrediente, editarIngrediente, registrarEntrada } from '../services/api';

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

  const displayInventario = [...inventario].sort((a, b) => {
    if (soloStockBajo) {
      const ratioA = a.stock_minimo === 0 ? 0 : a.cantidad_actual / a.stock_minimo;
      const ratioB = b.stock_minimo === 0 ? 0 : b.cantidad_actual / b.stock_minimo;
      return ratioA - ratioB;
    }
    return 0;
  });

  return (
    <>
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
                    {hasRole(['administrador']) && <th className="p-4 text-center pr-6">Acciones</th>}
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
                        {hasRole(['administrador']) && (
                          <td className="p-4 text-center pr-6">
                            <div className="flex items-center justify-center gap-2">
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
    </>
  );
}
