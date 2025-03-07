// Configuración centralizada para la autenticación de Supabase
export const SITE_URL = 'https://aztec-nuevo.onrender.com';
export const AUTH_REDIRECT_URL = `${SITE_URL}/auth/callback`;

// Función para obtener la URL del sitio
export function getSiteUrl() {
  return SITE_URL;
}

// No intentamos sobrescribir window.location.origin ya que causa errores
// en navegadores modernos que protegen esta propiedad 