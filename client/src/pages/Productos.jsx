import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { clearAuth, getInitials, getUsuario } from '../utils/auth';
import {
  getAllProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getReceta,
  updateReceta,
  getInventario
} from '../services/api';

export default function Productos() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  const [prodNombre, setProdNombre] = useState('');
  const [prodDescripcion, setProdDescripcion] = useState('');
  const [prodPrecio, setProdPrecio] = useState('');
  const [prodCategoria, setProdCategoria] = useState('');
  const [prodDisponible, setProdDisponible] = useState(true);
  const [prodError, setProdError] = useState('');
  const [prodSubmitting, setProdSubmitting] = useState(false);

  // Recipe Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [activeRecipeProduct, setActiveRecipeProduct] = useState(null);
  const [recetaItems, setRecetaItems] = useState([]);
  const [inventario, setInventario] = useState([]);
  
  const [recipeError, setRecipeError] = useState('');
  const [recipeSubmitting, setRecipeSubmitting] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [catNombre, setCatNombre] = useState('');
  const [catError, setCatError] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, invRes] = await Promise.all([
        getAllProductos(),
        getCategorias(),
        getInventario(false)
      ]);
      setProductos(prodRes.data || []);
      setCategorias(catRes.data || []);
      setInventario(invRes.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // --- Product Management ---
  const openNewProductModal = () => {
    setIsEditingProduct(false);
    setEditingProductId(null);
    setProdNombre('');
    setProdDescripcion('');
    setProdPrecio('');
    setProdCategoria(categorias.length > 0 ? categorias[0].id : '');
    setProdDisponible(true);
    setProdError('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p) => {
    setIsEditingProduct(true);
    setEditingProductId(p.id);
    setProdNombre(p.nombre);
    setProdDescripcion(p.descripcion || '');
    setProdPrecio(p.precio);
    setProdCategoria(p.categoria_id);
    setProdDisponible(p.disponible);
    setProdError('');
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodNombre || !prodPrecio || !prodCategoria) {
      setProdError('Nombre, precio y categoría son obligatorios.');
      return;
    }
    setProdSubmitting(true);
    setProdError('');
    try {
      const payload = {
        nombre: prodNombre,
        descripcion: prodDescripcion,
        precio: parseFloat(prodPrecio),
        categoria_id: parseInt(prodCategoria),
        disponible: prodDisponible
      };

      if (isEditingProduct) {
        await updateProducto(editingProductId, payload);
        setSuccessMessage('Producto actualizado exitosamente.');
      } else {
        await createProducto(payload);
        setSuccessMessage('Producto creado exitosamente.');
      }
      setIsProductModalOpen(false);
      loadInitialData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setProdError(err.message || 'Error al guardar el producto.');
    } finally {
      setProdSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto? Se eliminará de forma permanente.')) return;
    try {
      await deleteProducto(id);
      setSuccessMessage('Producto eliminado exitosamente.');
      loadInitialData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Error al eliminar el producto.');
    }
  };

  // --- Category Management ---
  const resetCategoryForm = () => {
    setIsEditingCategory(false);
    setEditingCategoryId(null);
    setCatNombre('');
    setCatError('');
  };

  const openCategoryModal = () => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setIsEditingCategory(true);
    setEditingCategoryId(cat.id);
    setCatNombre(cat.nombre);
    setCatError('');
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catNombre.trim()) {
      setCatError('El nombre de la categoría es obligatorio.');
      return;
    }
    setCatSubmitting(true);
    setCatError('');
    try {
      const payload = { nombre: catNombre.trim() };
      if (editingCategoryId != null) {
        await updateCategoria(editingCategoryId, payload);
        setSuccessMessage('Categoría actualizada exitosamente.');
      } else {
        await createCategoria(payload);
        setSuccessMessage('Categoría creada exitosamente.');
      }
      resetCategoryForm();
      await loadInitialData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setCatError(err.message || 'Error al guardar la categoría.');
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    setCatError('');
    try {
      await deleteCategoria(id);
      setSuccessMessage('Categoría eliminada correctamente.');
      if (editingCategoryId === id) {
        resetCategoryForm();
      }
      loadInitialData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setCatError(err.message || 'Error al eliminar la categoría.');
    }
  };

  // --- Recipe Management ---
  const openRecipeModal = async (product) => {
    setActiveRecipeProduct(product);
    setIsRecipeModalOpen(true);
    setRecipeError('');
    setRecetaItems([]);
    try {
      const res = await getReceta(product.id);
      // Ensure we map standard API output to internal state format
      const items = res.data.map(item => ({
        ingrediente_id: item.ingrediente_id,
        nombre: item.nombre,
        unidad: item.unidad,
        cantidad: item.cantidad
      }));
      setRecetaItems(items);
    } catch (err) {
      setRecipeError('No se pudo cargar la receta actual.');
    }
  };

  const addRecipeItem = () => {
    if (inventario.length === 0) return;
    setRecetaItems([...recetaItems, {
      ingrediente_id: inventario[0].ingrediente_id,
      nombre: inventario[0].nombre,
      unidad: inventario[0].unidad,
      cantidad: 1
    }]);
  };

  const updateRecipeItem = (index, field, value) => {
    const updated = [...recetaItems];
    if (field === 'ingrediente_id') {
      const invItem = inventario.find(i => i.ingrediente_id === parseInt(value));
      if (invItem) {
        updated[index].ingrediente_id = invItem.ingrediente_id;
        updated[index].nombre = invItem.nombre;
        updated[index].unidad = invItem.unidad;
      }
    } else if (field === 'cantidad') {
      updated[index].cantidad = value;
    }
    setRecetaItems(updated);
  };

  const removeRecipeItem = (index) => {
    const updated = [...recetaItems];
    updated.splice(index, 1);
    setRecetaItems(updated);
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    setRecipeSubmitting(true);
    setRecipeError('');
    try {
      const payload = recetaItems.map(item => ({
        ingrediente_id: parseInt(item.ingrediente_id),
        cantidad: parseFloat(item.cantidad)
      }));
      await updateReceta(activeRecipeProduct.id, payload);
      setSuccessMessage('Receta actualizada exitosamente.');
      setIsRecipeModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setRecipeError(err.message || 'Error al guardar la receta.');
    } finally {
      setRecipeSubmitting(false);
    }
  };

  return (
    <>
      {/* 3. ÁREA DE TRABAJO */}
      <main className="flex-1 p-8 overflow-y-auto">
          {/* Título de la Página */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-wide mb-1">Catálogo de Productos</h1>
              <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
                Gestiona los productos finales y sus recetas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCategoryModal}
                className="flex items-center gap-2 bg-[#141416] hover:bg-[#1E1E1E] text-neutral-400 hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-transparent hover:border-[#333] cursor-pointer"
              >
                <Icon path={ICONS.settings} className="w-4 h-4" />
                Administrar Categorías
              </button>
              <button
                type="button"
                onClick={openNewProductModal}
                className="text-xs font-bold uppercase tracking-wider text-white bg-[#E8530A] hover:bg-[#ff6214] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#E8530A]/20"
              >
                <Icon path={ICONS.plus} className="w-4 h-4" />
                Nuevo Producto
              </button>
            </div>
          </div>

        {/* Alerts */}
        {(error || successMessage) && (
          <div className="px-8 mt-6 shrink-0">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3">
                <Icon path={ICONS.alertTriangle} className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg flex items-center gap-3">
                <Icon path={ICONS.check} className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{successMessage}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-card border border-[#1E1E1E] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E1E1E] bg-[#141416]">
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría</th>
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precio</th>
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                      <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E1E]">
                    {productos.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-muted-foreground">
                          No hay productos registrados.
                        </td>
                      </tr>
                    ) : (
                      productos.map((prod) => {
                        const esBebida = prod.categoria.toLowerCase().includes('bebida');
                        
                        const getCategoryIcon = (category) => {
                          const cat = category.toLowerCase();
                          if (cat.includes('hamburguesa') || cat.includes('burger')) return '🍔';
                          if (cat.includes('bebida') || cat.includes('refresco') || cat.includes('jugo')) return '🥤';
                          if (cat.includes('postre') || cat.includes('helado')) return '🍰';
                          if (cat.includes('complemento') || cat.includes('papa') || cat.includes('snack')) return '🍟';
                          if (cat.includes('ensalada')) return '🥗';
                          if (cat.includes('combo')) return '🍱';
                          return '📦';
                        };

                        return (
                        <tr key={prod.id} className="hover:bg-[#141416]/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#141416] to-[#0E0E10] border border-[#1E1E1E] flex items-center justify-center text-2xl shadow-sm">
                                {getCategoryIcon(prod.categoria)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{prod.nombre}</p>
                                {prod.descripcion && <p className="text-xs text-neutral-500 mt-0.5">{prod.descripcion}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#141416] border border-[#1E1E1E] text-xs font-medium text-neutral-400 capitalize">
                              {prod.categoria}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold text-white">${prod.precio.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              prod.disponible
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${prod.disponible ? 'bg-success' : 'bg-red-500'}`}></span>
                              {prod.disponible ? 'Disponible' : 'Agotado'}
                            </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="flex items-center gap-2 bg-[#141416] hover:bg-[#1E1E1E] text-neutral-400 hover:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-transparent hover:border-[#333]"
                              title="Editar Producto"
                            >
                              <Icon path={ICONS.edit} className="w-4 h-4" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => !esBebida && openRecipeModal(prod)}
                              disabled={esBebida}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                                esBebida 
                                  ? 'bg-neutral-900/50 text-neutral-600 border-transparent cursor-not-allowed'
                                  : 'bg-[#141416] hover:bg-[#1E1E1E] text-neutral-400 hover:text-white border-transparent hover:border-[#333]'
                              }`}
                              title={esBebida ? "Las bebidas no requieren receta" : "Gestionar Receta"}
                            >
                              <Icon path={ICONS.box} className="w-4 h-4" />
                              <span className="hidden sm:inline">Receta</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="flex items-center justify-center bg-[#141416] hover:bg-red-500/10 text-neutral-400 hover:text-red-500 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              title="Eliminar"
                            >
                              <Icon path={ICONS.trash} className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-[#1E1E1E] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#1E1E1E] flex items-center justify-between shrink-0 bg-[#141416]">
              <h2 className="text-xl font-bold text-foreground">
                {isEditingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <Icon path={ICONS.x} className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {prodError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded-lg text-sm">
                  {prodError}
                </div>
              )}
              <form id="productForm" onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
                  <input
                    type="text"
                    value={prodNombre}
                    onChange={(e) => setProdNombre(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ej. Hamburguesa Clásica"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
                  <textarea
                    value={prodDescripcion}
                    onChange={(e) => setProdDescripcion(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Descripción breve..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={prodPrecio}
                      onChange={(e) => setProdPrecio(e.target.value)}
                      className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
                    <select
                      value={prodCategoria}
                      onChange={(e) => setProdCategoria(e.target.value)}
                      className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors capitalize"
                      required
                    >
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodDisponible}
                      onChange={(e) => setProdDisponible(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-foreground">Producto Disponible (Visible)</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-[#1E1E1E] flex justify-end gap-3 shrink-0 bg-[#141416]">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#1E1E1E] hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={prodSubmitting}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prodSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-[#1E1E1E] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#1E1E1E] flex items-center justify-between shrink-0 bg-[#141416]">
              <h2 className="text-xl font-bold text-foreground">Administrar Categorías</h2>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  resetCategoryForm();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <Icon path={ICONS.x} className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {catError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded-lg text-sm">
                  {catError}
                </div>
              )}

              <div className="space-y-2 mb-6">
                {categorias.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-[#1E1E1E] rounded-lg">
                    No hay categorías registradas.
                  </div>
                ) : (
                  categorias.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-3"
                    >
                      <span className="text-sm font-medium text-foreground capitalize">{cat.nombre}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategoryModal(cat)}
                          className="flex items-center justify-center bg-[#141416] hover:bg-[#1E1E1E] text-neutral-400 hover:text-white w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-[#333]"
                          title="Editar categoría"
                        >
                          <Icon path={ICONS.edit} className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="flex items-center justify-center bg-[#141416] hover:bg-red-500/10 text-neutral-400 hover:text-red-500 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Eliminar categoría"
                        >
                          <Icon path={ICONS.trash} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form id="categoryForm" onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {isEditingCategory ? 'Editar categoría' : 'Nueva categoría'}
                  </label>
                  <input
                    type="text"
                    value={catNombre}
                    onChange={(e) => setCatNombre(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ej. Hamburguesas"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-[#1E1E1E] flex justify-end gap-3 shrink-0 bg-[#141416]">
              {isEditingCategory && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#1E1E1E] hover:text-foreground transition-colors"
                >
                  Cancelar edición
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  resetCategoryForm();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#1E1E1E] hover:text-foreground transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                form="categoryForm"
                disabled={catSubmitting}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {catSubmitting ? 'Guardando...' : (isEditingCategory ? 'Actualizar' : 'Agregar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-[#1E1E1E] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#1E1E1E] flex items-center justify-between shrink-0 bg-[#141416]">
              <div>
                <h2 className="text-xl font-bold text-foreground">Receta de Producto</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeRecipeProduct?.nombre}</p>
              </div>
              <button
                onClick={() => setIsRecipeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <Icon path={ICONS.x} className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {recipeError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded-lg text-sm">
                  {recipeError}
                </div>
              )}
              
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-medium text-foreground">Ingredientes Necesarios</h3>
                <button
                  type="button"
                  onClick={addRecipeItem}
                  className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <Icon path={ICONS.plus} className="w-4 h-4" /> Agregar Ingrediente
                </button>
              </div>

              {recetaItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-[#1E1E1E] rounded-lg">
                  Este producto no tiene receta configurada.<br/>(No descontará ingredientes al venderse).
                </div>
              ) : (
                <div className="space-y-3">
                  {recetaItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-muted-foreground mb-1">Ingrediente</label>
                        <select
                          value={item.ingrediente_id}
                          onChange={(e) => updateRecipeItem(idx, 'ingrediente_id', e.target.value)}
                          className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          {inventario.map(inv => (
                            <option key={inv.ingrediente_id} value={inv.ingrediente_id}>
                              {inv.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-muted-foreground mb-1">Cant. ({item.unidad})</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={item.cantidad}
                          onChange={(e) => updateRecipeItem(idx, 'cantidad', e.target.value)}
                          className="w-full bg-[#141416] border border-[#1E1E1E] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipeItem(idx)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 mb-[1px]"
                      >
                        <Icon path={ICONS.trash} className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#1E1E1E] flex justify-end gap-3 shrink-0 bg-[#141416]">
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#1E1E1E] hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRecipeSubmit}
                disabled={recipeSubmitting}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recipeSubmitting ? 'Guardando...' : 'Guardar Receta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
