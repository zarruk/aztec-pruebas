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
    // Deshabilitar ignoreBuildErrors para detectar errores de tipo
    ignoreBuildErrors: false,
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
  // La opción serverComponentsExternalPackages ha sido eliminada porque no es compatible con Next.js 15.2.1
  // Configuración de seguridad
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https://xzwkrwrhmsiesydasuff.supabase.co;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              block-all-mixed-content;
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 