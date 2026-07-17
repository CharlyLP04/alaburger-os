import React, { useEffect, useState } from 'react';
import { Icon, ICONS } from './Icon';

export function Toast({ message, type = 'info', onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  // Auto-close logic
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000); // 3 seconds visible
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // wait for fade-out animation
  };

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
          icon: ICONS.check,
          title: 'Éxito'
        };
      case 'warning':
        return {
          bg: 'bg-destructive/10',
          text: 'text-destructive',
          border: 'border-destructive/20',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
          icon: ICONS.bell,
          title: 'Advertencia'
        };
      default:
        return {
          bg: 'bg-[#E8530A]/10',
          text: 'text-[#E8530A]',
          border: 'border-[#E8530A]/20',
          glow: 'shadow-[0_0_20px_rgba(232,83,10,0.15)]',
          icon: ICONS.settings,
          title: 'Información'
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col overflow-hidden bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[460px] max-w-xl transition-all duration-300 ${isClosing ? 'opacity-0 -translate-y-4 scale-95' : 'animate-in slide-in-from-top-8 fade-in zoom-in-95'}`}>
      
      <div className="flex items-center gap-6 px-8 py-6">
        {/* Ícono Brillante */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text} ${style.border} border ${style.glow}`}>
          <Icon path={style.icon} size={28} />
        </div>
        
        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-white uppercase tracking-wider leading-tight">
            {style.title}
          </p>
          <p className="text-sm font-bold text-neutral-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Botón Cerrar */}
        <button 
          onClick={handleClose} 
          className="text-neutral-500 hover:text-white ml-2 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          aria-label="Cerrar notificación"
        >
          <Icon path={ICONS.x} size={24} />
        </button>
      </div>

      {/* Barra de Progreso */}
      <div className="h-1 w-full bg-white/5">
        <div 
          className={`h-full ${style.bg.replace('/10', '')} origin-left`}
          style={{ animation: 'toast-progress 3s linear forwards' }}
        />
      </div>
    </div>
  );
}
