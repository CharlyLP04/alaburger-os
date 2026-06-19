import React from 'react';

export default function Login() {
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
            <span className="text-xs font-semibold tracking-wider text-foreground">PLATAFORMA SaaS PARA RESTAURANTES</span>
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
            
            <form className="space-y-5">
              {/* Input Correo */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="email">
                  Correo
                </label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-muted border border-transparent focus:border-primary text-foreground rounded-lg px-4 py-3 outline-none transition-colors"
                />
              </div>

              {/* Input Contraseña */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="password">
                  Contraseña
                </label>
                <input 
                  type="password" 
                  id="password"
                  placeholder="••••••••"
                  className="w-full bg-muted border border-transparent focus:border-primary text-foreground rounded-lg px-4 py-3 outline-none transition-colors"
                />
              </div>

              {/* Botón de Submit */}
              <button 
                type="button" 
                className="w-full bg-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
              >
                Iniciar Sesión
              </button>
            </form>

            {/* Link secundario */}
            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Solicitar Demo &rarr;
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}