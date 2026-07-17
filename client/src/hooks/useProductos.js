import { useState, useEffect, useCallback } from 'react';
import { getProductosList, getCategoriasProducto } from '../services/api';

const PAGE_SIZE = 20;

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoriaId, setCategoriaId] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [categorias, setCategorias] = useState([]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: PAGE_SIZE };

      if (categoriaId) {
        params.categoria_id = categoriaId;
      }

      if (filtroActivo === 'activos') {
        params.activo = true;
      } else if (filtroActivo === 'inactivos') {
        params.activo = false;
      }

      const resultado = await getProductosList(params);
      setProductos(resultado.data || []);
      setTotal(resultado.total ?? 0);
      setTotalPages(resultado.totalPages ?? 1);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'No se pudieron cargar los productos.');
      setProductos([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, categoriaId, filtroActivo]);

  const fetchCategorias = useCallback(async () => {
    try {
      const lista = await getCategoriasProducto();
      setCategorias(lista);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleCategoriaChange = (value) => {
    setPage(1);
    setCategoriaId(value);
  };

  const handleActivoChange = (value) => {
    setPage(1);
    setFiltroActivo(value);
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  return {
    productos,
    loading,
    error,
    page,
    totalPages,
    total,
    categoriaId,
    filtroActivo,
    categorias,
    refresh: fetchProductos,
    handleCategoriaChange,
    handleActivoChange,
    goToPreviousPage,
    goToNextPage,
  };
}
