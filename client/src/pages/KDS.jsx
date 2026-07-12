import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, ICONS } from '../components/ui/Icon';
import { getUsuario } from '../utils/auth';

const ORDERS = [
  { id: "#4822", table: "MESA 3", time: "3:19", status: "PREPARANDO", items: [
      { name: "JALAPEÑO INFERNO ×1", mods: [{ type: "extra", text: "EXTRA QUESO" }] },
      { name: "CLASSIC SMASH ×1", mods: [] }
    ]
  },
  { id: "#4823", table: "MESA 1", time: "2:52", status: "PREPARANDO", items: [
      { name: "CLASSIC SMASH ×3", mods: [{ type: "remove", text: "SIN CEBOLLA" }, { type: "remove", text: "SIN PEPINILLOS" }] }
    ]
  },
  { id: "#4824", table: "MESA 2", time: "2:40", status: "NUEVO", items: [
      { name: "BBQ BACON TOWER ×2", mods: [{ type: "extra", text: "EXTRA QUESO" }, { type: "add", text: "EXTRA TOCINO" }] }
    ]
  },
  { id: "#4821", table: "MESA 5", time: "5:55", status: "LISTO", items: [
      { name: "CLASSIC SMASH ×2", mods: [{ type: "remove", text: "SIN CEBOLLA" }, { type: "add", text: "EXTRA TOCINO" }] },
      { name: "BBQ BACON TOWER ×1", mods: [{ type: "remove", text: "SIN PEPINILLOS" }] }
    ]
  }
];

export default function KDS() {
  const usuario = getUsuario();
  const getModColor = (type) => {
    if (type === 'remove') return 'border-destructive text-destructive bg-destructive/10';
    if (type === 'add') return 'border-secondary text-secondary bg-secondary/10';
    return 'border-success text-success bg-success/10'; // extra
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      
      {/* Header Cocina */}
      <header className="flex justify-between items-center mb-8 border-b border-[#1E1E1E] pb-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs">A</div>
            <h1 className="font-bold tracking-widest text-sm uppercase text-white">Burger OS <span className="text-muted-foreground ml-2">/ KDS Cocina</span></h1>
          </Link>
          {usuario?.rol === 'administrador' && (
            <Link to="/" className="text-xs bg-[#1E1E1E] hover:bg-neutral-800 border border-[#2A2A2F] text-neutral-300 font-bold px-3 py-1.5 rounded-lg transition-colors ml-2">
              Volver al Panel
            </Link>
          )}
        </div>
        <div className="flex gap-4 text-xs font-bold tracking-wider">
          <span className="text-muted-foreground">MODIFICACIONES:</span>
          <span className="text-destructive flex items-center gap-1"><div className="w-2 h-2 border border-destructive"></div> ELIMINAR</span>
          <span className="text-secondary flex items-center gap-1"><div className="w-2 h-2 border border-secondary"></div> AGREGAR</span>
          <span className="text-success flex items-center gap-1"><div className="w-2 h-2 border border-success"></div> EXTRA</span>
        </div>
      </header>

      {/* Grid de Comandas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDERS.map((order) => (
          <div key={order.id} className="bg-card border border-[#1E1E1E] rounded-xl p-5 flex flex-col h-full">
            {/* Cabecera de la comanda */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black">{order.id}</h2>
              <span className="bg-[#1E1E1E] text-muted-foreground text-xs font-bold px-2 py-1 rounded tracking-widest">{order.table}</span>
            </div>
            
            <div className={`flex items-center gap-1 mb-6 font-bold ${order.status === 'LISTO' ? 'text-success' : 'text-success'}`}>
               <Icon path={ICONS.clock} size={14} />
               {order.time} <span className="text-muted-foreground text-xs ml-1 font-normal">transcurrido</span>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-5">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <p className="font-bold uppercase tracking-wide text-sm mb-2">{item.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.mods.map((mod, midx) => (
                      <span key={midx} className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${getModColor(mod.type)}`}>
                        {mod.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="mt-6">
              {order.status === 'LISTO' ? (
                <button className="w-full bg-success/20 text-success border border-success font-bold py-3 rounded-lg flex items-center justify-center gap-2 tracking-widest text-sm">
                  LISTO <Icon path={ICONS.check} size={16} />
                </button>
              ) : (
                <div className="space-y-2">
                  {order.status === 'NUEVO' && <div className="text-center text-primary text-xs font-bold tracking-widest mb-2">NUEVO</div>}
                  <button className="w-full bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 tracking-widest text-sm hover:bg-[#c94508] transition-colors">
                    <Icon path={ICONS.chef} size={16} /> PREPARANDO
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}