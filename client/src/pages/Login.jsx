import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { consumeAuthMessage, getDefaultRouteForRole, setAuth } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pendingMessage = consumeAuthMessage();
    if (pendingMessage) {
      setError(pendingMessage);
    }
  }, []);

  const validateForm = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('El usuario es obligatorio.');
      return false;
    }

    if (!password) {
      setError('La contraseña es obligatoria.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await loginApi(email.trim(), password);
      setAuth(data.token, data.usuario);
      navigate(getDefaultRouteForRole(data.usuario?.rol), { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal con fondo oscuro y patrón de cuadrícula
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]">
      
      {/* Navbar Simple */}
      <nav className="w-full p-6 flex items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white font-bold w-8 h-8 flex items-center justify-center rounded">
            A
          </div>
          <span className="font-bold tracking-widest text-sm">A LA BURGER OS</span>
        </div>
      </nav>

      {/* Contenido Principal a dos columnas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Columna Izquierda: Textos */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-muted bg-card">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs font-semibold tracking-wider text-foreground">PLATAFORMA PARA RESTAURANTES</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight uppercase leading-none">
            Tu operación,<br />
            <span className="text-primary">sin caos.</span>
          </h1>

          {/* Descripción */}
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            A La Burger OS centraliza pedidos, inventario y administración en una sola plataforma. Diseñado exclusivamente para cadenas de hamburguesas que quieren crecer con control total.
          </p>
        </div>

        {/* Columna Derecha: Tarjeta de Login */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-card p-8 rounded-2xl border border-muted shadow-2xl">
            <h2 className="text-xl font-bold mb-6 tracking-wide uppercase">Login</h2>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              {/* Input Usuario */}
              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">
                  Usuario
                </label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. admin"
                  required
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-primary focus:ring-1 focus:ring-primary text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 font-bold"
                />
              </div>

              {/* Input Contraseña */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-muted border border-transparent focus:border-primary text-foreground rounded-lg pl-4 pr-12 py-3 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-1 rounded focus:outline-none"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de Submit */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Link secundario */}
            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
               
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
