import withLinaria, { type LinariaConfig } from 'next-with-linaria';

const nextConfig: LinariaConfig = {
  async redirects() {
    return [
      {
        source: '/case-studies/realytics',
        destination: '/case-studies/w3villa',
        permanent: true,
      },
      {
        source: '/case-studies/beagle',
        destination: '/case-studies/act-education',
        permanent: true,
      },
      {
        source: '/case-studies/evergreen',
        destination: '/case-studies/netzero',
        permanent: true,
      },
    ];
  },
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
