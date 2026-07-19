import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { getProductos, crearPedido } from '../services/api';
import { getUsuario } from '../utils/auth';

const MESA_ID = 5;

const CATEGORY_EMOJI = {
  Hamburguesas: '🍔',
  Bebidas: '🥤',
  Complementos: '🍟',
  Postres: '🍰',
};

const CATEGORY_ORDER = [
  'Hamburguesas',
  'Complementos',
  'Bebidas',
  'Postres',
];

function getEmoji(categoria) {
  return CATEGORY_EMOJI[categoria] || '🍔';
}

export default function WaiterApp() {
  const usuario = getUsuario();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProductos() {
      try {
        const data = await getProductos();
        if (!cancelled) {
          setProductos(data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudieron cargar los productos.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProductos();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (productoId) => {
    setCart((prev) => ({
      ...prev,
      [productoId]: (prev[productoId] || 0) + 1,
    }));
    setOrderMessage(null);
  };

  const incrementItem = (productoId) => {
    setCart((prev) => ({
      ...prev,
      [productoId]: (prev[productoId] || 0) + 1,
    }));
    setOrderMessage(null);
  };

  const decrementItem = (productoId) => {
    setCart((prev) => {
      const current = prev[productoId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productoId];
        return next;
      }
      return {
        ...prev,
        [productoId]: current - 1,
      };
    });
    setOrderMessage(null);
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  useEffect(() => {
    if (cartCount === 0) {
      setShowCart(false);
    }
  }, [cartCount]);

  const cartItems = productos
    .filter((p) => cart[p.id])
    .map((p) => ({
      ...p,
      cantidad: cart[p.id],
    }));

  const cartTotal = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const categoriasAgrupadas = useMemo(() => {
    const mapa = new Map();

    for (const producto of productos) {
      const nombre = producto.categoria;
      if (!nombre) continue;

      if (!mapa.has(nombre)) {
        mapa.set(nombre, []);
      }
      mapa.get(nombre).push(producto);
    }

    return Array.from(mapa.entries())
      .sort(([a], [b]) => {
        const indexA = CATEGORY_ORDER.indexOf(a);
        const indexB = CATEGORY_ORDER.indexOf(b);
        const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA;
        const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB;

        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b, 'es');
      })
      .map(([nombre, productosCategoria]) => ({
        nombre,
        productos: productosCategoria,
      }));
  }, [productos]);

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setOrderMessage(null);

    try {
      const payload = {
        mesa_id: MESA_ID,
        mesero_id: usuario?.id || 1,
        tipo: 'local',
        productos: cartItems.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
        })),
      };

      const data = await crearPedido(payload);
      setOrderMessage({
        type: 'success',
        text: `${data.mensaje} — Pedido #${data.pedido.id} · Total $${data.pedido.total}`,
      });
      setCart({});
      setShowCart(false);
    } catch (err) {
      setOrderMessage({
        type: 'error',
        text: err.message || 'No se pudo crear el pedido.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      {/* Contenedor simulando la pantalla del celular */}
      <div className="w-full max-w-md border-x border-[#1E1E1E] flex flex-col h-screen">
        
        {/* Header App Mesero */}
        <header className="p-6 flex justify-between items-center border-b border-[#1E1E1E]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-primary text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs">A</div>
                <h1 className="font-bold tracking-widest text-lg text-white">BURGER OS</h1>
              </Link>
              {usuario?.rol === 'administrador' && (
                <Link to="/" className="text-[10px] bg-[#1E1E1E] border border-[#2A2A2F] text-neutral-300 font-bold px-2.5 py-1 rounded-lg ml-2 transition-colors uppercase">
                  Panel
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground">
              MESA <span className="bg-primary text-white px-2 py-0.5 rounded text-xs">5</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCart((prev) => !prev)}
            className="bg-card p-3 rounded-xl border border-[#1E1E1E] hover:bg-[#1E1E1E] transition-colors relative"
          >
            <Icon path={ICONS.cart} size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {orderMessage && (
          <div
            className={`mx-4 mt-4 px-4 py-3 rounded-xl text-sm font-semibold border ${
              orderMessage.type === 'success'
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}
          >
            {orderMessage.text}
          </div>
        )}

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="text-muted-foreground text-sm text-center py-8">Cargando productos...</p>
          )}

          {error && (
            <p className="text-destructive text-sm text-center py-8">{error}</p>
          )}

          {!loading && !error && categoriasAgrupadas.map((categoria) => (
            <section key={categoria.nombre} className="space-y-4">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                {getEmoji(categoria.nombre)} {categoria.nombre.toUpperCase()}
              </h2>
              {categoria.productos.map((item) => (
                <div key={item.id} className="bg-card p-4 rounded-xl border border-[#1E1E1E] flex gap-4">
                  <div className="text-4xl pt-1">{getEmoji(item.categoria)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg tracking-wide uppercase">{item.nombre}</h3>
                    <p className="text-muted-foreground text-sm leading-snug mb-3">
                      {item.descripcion}
                    </p>
                    <div className="text-primary font-bold text-xl">${item.precio}</div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => addToCart(item.id)}
                      className="bg-primary text-white p-2 rounded-full hover:bg-[#c94508] transition-colors"
                    >
                      <Icon path={ICONS.plus} size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        {showCart && cartItems.length > 0 && (
          <div className="border-t border-[#1E1E1E] bg-card p-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className="bg-[#141416] border border-[#1E1E1E] text-white w-8 h-8 rounded-full hover:bg-[#1E1E1E] transition-colors flex items-center justify-center font-bold"
                      aria-label={`Disminuir ${item.nombre}`}
                    >
                      −
                    </button>
                    <span className="font-bold w-5 text-center">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className="bg-primary text-white w-8 h-8 rounded-full hover:bg-[#c94508] transition-colors flex items-center justify-center"
                      aria-label={`Aumentar ${item.nombre}`}
                    >
                      <Icon path={ICONS.plus} size={16} />
                    </button>
                  </div>
                  <span className="text-muted-foreground">{item.nombre}</span>
                </div>
                <span className="font-bold shrink-0">${(item.precio * item.cantidad).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#1E1E1E]">
              <span>Total</span>
              <span className="text-primary">${cartTotal.toFixed(0)}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-primary hover:bg-[#c94508] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Enviando pedido...' : 'Confirmar pedido'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
