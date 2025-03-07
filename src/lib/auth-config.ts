// Configuración centralizada para la autenticación de Supabase
export const SITE_URL = 'https://aztec-nuevo.onrender.com';
export const AUTH_REDIRECT_URL = `${SITE_URL}/auth/callback`;

// Función para forzar la URL de redirección en el navegador
export function forceRedirectUrl() {
  if (typeof window !== 'undefined') {
    try {
      // Definir una propiedad getter para origin que siempre devuelva la URL correcta
      Object.defineProperty(window.location, 'origin', {
        get: function() { return SITE_URL; }
      });
      
      console.log('window.location.origin sobrescrito a:', window.location.origin);
    } catch (e) {
      console.error('Error al sobrescribir window.location.origin:', e);
    }
  }
}

// Llamar a la función automáticamente cuando se importa este archivo en el cliente
if (typeof window !== 'undefined') {
  forceRedirectUrl();
} 