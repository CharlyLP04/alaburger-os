import React, { useState, useEffect } from 'react';
import { Icon, ICONS } from '../components/ui/Icon';
import { Toast } from '../components/ui/Toast';
import { getUsuarios, getRoles, createUsuario, updateUsuario, toggleUsuarioStatus } from '../services/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getUsuarios(),
        getRoles()
      ]);
      setUsuarios(usersData);
      setRoles(rolesData);
    } catch (error) {
      showToast('Error al cargar los usuarios o roles.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setRolId('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setNombre(user.nombre);
    setApellido(user.apellido);
    setEmail(user.email);
    setPassword(''); // Leave blank unless they want to change it
    setRolId(user.rol_id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const response = await toggleUsuarioStatus(user.id);
      showToast(response.mensaje, 'success');
      fetchInitialData(); // Refresh list
    } catch (error) {
      showToast(error.message || 'Error al cambiar estado.', 'warning');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, {
          nombre,
          apellido,
          email,
          rol_id: parseInt(rolId, 10),
          password: password || undefined
        });
        showToast('Usuario actualizado correctamente.', 'success');
      } else {
        await createUsuario({
          nombre,
          apellido,
          email,
          rol_id: parseInt(rolId, 10),
          password
        });
        showToast('Usuario creado correctamente.', 'success');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) {
      showToast(error.message || 'Error al guardar el usuario.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1 bg-[#0A0A0B] overflow-y-auto">
        <div className="p-8 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Icon path={ICONS.users} size={28} className="text-[#E8530A]" />
                Gestión de Empleados
              </h1>
              <p className="text-neutral-400 text-sm mt-1 font-bold">
                Crea usuarios y asigna permisos a tu equipo de trabajo.
              </p>
            </div>
            
            <button
              onClick={openCreateModal}
              className="bg-[#E8530A] hover:bg-[#ff6214] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(232,83,10,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Icon path={ICONS.plus} size={20} />
              Nuevo Empleado
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#141416] border border-[#1F1F23] rounded-2xl overflow-hidden shadow-2xl relative">
            {isLoading ? (
              <div className="p-12 text-center text-neutral-500 font-bold flex flex-col items-center justify-center gap-4">
                <Icon path={ICONS.refresh} size={32} className="animate-spin" />
                Cargando empleados...
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 font-bold">
                No hay empleados registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#09090A] text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-[#1F1F23]">
                      <th className="px-6 py-4 rounded-tl-2xl">Empleado</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold divide-y divide-[#1F1F23]/50">
                    {usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1C1C1F] border border-[#27272A] flex items-center justify-center text-neutral-300 font-black text-xs uppercase">
                              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                            </div>
                            <div>
                              <p className="text-neutral-200">{user.nombre} {user.apellido}</p>
                              <p className="text-xs text-neutral-500">@{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#E8530A]/10 text-[#E8530A] border border-[#E8530A]/20">
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            user.activo ? 'bg-success/10 text-success border border-success/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.activo ? 'bg-success animate-pulse' : 'bg-neutral-500'}`}></span>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.id !== 1 && (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 text-neutral-400 hover:text-white bg-[#1C1C1F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer"
                                title="Editar empleado"
                              >
                                <Icon path={ICONS.edit} size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                  user.activo ? 'text-destructive hover:bg-destructive/10 bg-[#1C1C1F]' : 'text-success hover:bg-success/10 bg-[#1C1C1F]'
                                }`}
                                title={user.activo ? 'Desactivar empleado' : 'Activar empleado'}
                              >
                                <Icon path={user.activo ? ICONS.trash : ICONS.check} size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingUser ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1F1F23] focus:border-[#E8530A] focus:ring-1 focus:ring-[#E8530A] text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 font-bold"
                    placeholder="Ej. Juan"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full bg-[#141416] border border-[#1F1F23] focus:border-[#E8530A] focus:ring-1 focus:ring-[#E8530A] text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 font-bold"
                    placeholder="Ej. Pérez"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-[#E8530A] focus:ring-1 focus:ring-[#E8530A] text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 font-bold"
                  placeholder="Ej. juanperez"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">
                  Contraseña {editingUser && '(Opcional)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-[#E8530A] focus:ring-1 focus:ring-[#E8530A] text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 font-bold"
                  placeholder="********"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Rol</label>
                <select
                  required
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                  className="w-full bg-[#141416] border border-[#1F1F23] focus:border-[#E8530A] focus:ring-1 focus:ring-[#E8530A] text-white rounded-xl px-4 py-3 text-sm outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecciona un rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white px-6 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#E8530A] to-[#ff7333] hover:shadow-[0_0_20px_rgba(232,83,10,0.4)] disabled:opacity-50 px-6 py-3 rounded-xl transition-all cursor-pointer border border-white/10"
                >
                  {isSubmitting ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Local Toast integration */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
