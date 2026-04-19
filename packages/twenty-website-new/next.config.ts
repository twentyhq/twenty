import path from 'path';
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
  linaria: {
    configFile: path.resolve(__dirname, 'wyw-in-js.config.cjs'),
  },
  reactCompiler: true,
};

module.exports = withLinaria(nextConfig);
