import React from 'react';
import { Icon, ICONS } from '../components/ui/Icon';

const MENU_ITEMS = [
  { id: 1, name: "Doble carne, queso americano, lechuga, tomate", emoji: "🍔", price: 139 },
  { id: 2, name: "BBQ BACON TOWER", emoji: "🥩", price: 169, isPopular: true, desc: "Triple carne, tocino crujiente, salsa BBQ, cebolla caramelizada" },
  { id: 3, name: "JALAPEÑO INFERNO", emoji: "🌶️", price: 149, desc: "Carne, queso pepper jack, jalapeños, salsa picante" },
  { id: 4, name: "MUSHROOM SWISS", emoji: "🍄", price: 155, desc: "Carne, champiñones salteados, queso suizo derretido" },
];

export default function WaiterApp() {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      {/* Contenedor simulando la pantalla del celular */}
      <div className="w-full max-w-md border-x border-[#1E1E1E] flex flex-col h-screen">
        
        {/* Header App Mesero */}
        <header className="p-6 flex justify-between items-center border-b border-[#1E1E1E]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs">A</div>
              <h1 className="font-bold tracking-widest text-lg">BURGER OS</h1>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground">
              MESA <span className="bg-primary text-white px-2 py-0.5 rounded text-xs">5</span>
            </div>
          </div>
          <button className="bg-card p-3 rounded-xl border border-[#1E1E1E] hover:bg-[#1E1E1E] transition-colors">
            <Icon path={ICONS.cart} size={20} />
          </button>
        </header>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="bg-card p-4 rounded-xl border border-[#1E1E1E] flex gap-4">
              <div className="text-4xl pt-1">{item.emoji}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg tracking-wide uppercase">{item.name.split(',')[0]}</h3>
                {item.isPopular && (
                  <span className="bg-[#E8530A]/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                    Popular
                  </span>
                )}
                <p className="text-muted-foreground text-sm leading-snug mb-3">
                  {item.desc || item.name}
                </p>
                <div className="text-primary font-bold text-xl">${item.price}</div>
              </div>
              <div className="flex items-end">
                <button className="bg-primary text-white p-2 rounded-full hover:bg-[#c94508] transition-colors">
                  <Icon path={ICONS.plus} size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}