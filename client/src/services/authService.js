// Apunta a la URL de tu backend. Cambia el puerto si usas uno diferente al 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authService = {
  /**
   * Envía las credenciales al backend y almacena el token si es correcto
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Captura errores del backend (400 datos incompletos, 401 credenciales incorrectas, 429 rate-limit)
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Si el login es exitoso, guardamos el token y los datos del usuario en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
      }

      return data;
    } catch (error) {
      console.error('Error en authService.login:', error.message);
      throw error;
    }
  },

  /**
   * Limpia la sesión del usuario
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtiene los datos del usuario actual desde el almacenamiento local
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obtiene el token guardado para adjuntarlo a futuras peticiones protegidas
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};