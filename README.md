# 🍔 A La Burger OS 

> SaaS de gestión de pedidos, inventario y ventas 
> para A La Burger — sistema multi-sucursal.

## 🚀 ¿Qué problema resuelve?

A La Burger gestiona sus pedidos e inventario de forma 
manual en cada sucursal. Esto genera errores, descontrol 
de stock y falta de visibilidad entre sucursales.

**A La Burger OS** digitaliza la operación completa:
desde que el mesero toma el pedido hasta el cierre 
de caja — en tiempo real y desde cualquier sucursal.

## ✨ Funcionalidades principales

- 🧾 Registro de pedidos en tiempo real
- 🍳 Panel de cocina por sucursal
- 📦 Control de inventario automático por pedido
- 📊 Dashboard de ventas por sucursal
- 🔔 Alertas de stock bajo
- 🏪 Gestión multi-sucursal desde un solo panel
- 🔐 Roles: Administrador, Gerente, Cajero, Mesero

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (Supabase) |
| Tiempo real | Socket.io |
| Autenticación | JWT |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| Control de versiones | GitHub Flow |

## 📁 Estructura del proyecto
alaburger-os/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── docs/            # Documentación técnica
└── README.md

## 👥 Equipo

| Nombre | Rol |
|--------|-----|
| Castañeda Sánchez Dana Lizbeth | Product Owner |
| Olaya Gutiérrez Carlos | Tech Lead |
| Montalvo Osorio Alexis | Product Engineer |
| Flores Osorio Jarumi Guadalupe | QA / Delivery |
| Reyes Torres Manelic Alitzel | Growth Lead |

## ⚙️ Instalación local

```bash
git clone https://github.com/CharlyLP04/alaburger-os.git
cd alaburger-os

cd server && npm install
cd ../client && npm install
```

## 🔀 Flujo de trabajo

Usamos **GitHub Flow**. Ver [`docs/github-flow.md`](docs/github-flow.md)
y [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de cualquier cambio.

## 📌 Tablero del proyecto

[Ver tablero →](https://github.com/CharlyLP04/alaburger-os/issues)
