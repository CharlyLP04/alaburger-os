import React from 'react';
import { Link } from 'react-router-dom';
import { getDefaultRouteForRole, getUsuario } from '../utils/auth';

export default function Forbidden() {
  const usuario = getUsuario();
  const homeRoute = usuario ? getDefaultRouteForRole(usuario.rol) : '/login';

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="bg-card border border-muted rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <p className="text-primary font-black text-5xl mb-4">403</p>
        <h1 className="text-xl font-bold mb-2 uppercase tracking-wide">Acceso denegado</h1>
        <p className="text-sm text-muted-foreground mb-6">
          No tienes permisos para acceder a esta sección. (Rol detectado: {usuario?.rol || 'ninguno'})
        </p>
        <Link
          to={homeRoute}
          className="inline-block bg-primary hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {usuario ? 'Ir a mi inicio' : 'Iniciar sesión'}
        </Link>
      </div>
    </div>
  );
}
