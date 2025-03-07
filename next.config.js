const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xzwkrwrhmsiesydasuff.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xzwkrwrhmsiesydasuff.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // !! ADVERTENCIA !!
    // Permite que las compilaciones de producción se completen con éxito
    // incluso si tu proyecto tiene errores de tipo.
    // !! ADVERTENCIA !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@supabase/realtime-js/dist/module/lib/version'] = 
      path.resolve(__dirname, './src/lib/supabase-fix.js');
    config.resolve.alias['@edge-runtime/cookies'] = false;
    return config;
  },
  transpilePackages: ['@supabase/realtime-js', 'date-fns'],
  // Configuración para rutas dinámicas
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'aztec-nuevo.onrender.com'],
    },
  },
  // Configurar rutas que deben ser dinámicas
  // Esto evita que Next.js intente renderizar estáticamente rutas que usan cookies o sesiones
  serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
};

module.exports = nextConfig; 