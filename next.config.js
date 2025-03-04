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
};

module.exports = nextConfig; 