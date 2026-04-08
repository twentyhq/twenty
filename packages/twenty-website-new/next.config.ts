import withLinaria, { type LinariaConfig } from 'next-with-linaria';

const nextConfig: LinariaConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'twenty-icons.com',
        pathname: '/**',
        protocol: 'https',
      },
    ],
  },
  reactCompiler: true,
};

module.exports = withLinaria(nextConfig);
