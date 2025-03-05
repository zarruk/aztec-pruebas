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
};

module.exports = nextConfig; 