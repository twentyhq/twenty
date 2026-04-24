import path from 'path';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';

const nextConfig: LinariaConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
  async redirects() {
    return [
      // Documentation moved to docs.twenty.com (carried over from the
      // legacy twenty-website Next.js app).
      {
        source: '/user-guide',
        destination: 'https://docs.twenty.com/user-guide/introduction',
        permanent: true,
      },
      {
        source: '/user-guide/section/:folder/:slug*',
        destination: 'https://docs.twenty.com/user-guide/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/user-guide/:folder/:slug*',
        destination: 'https://docs.twenty.com/user-guide/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/developers',
        destination: 'https://docs.twenty.com/developers/introduction',
        permanent: true,
      },
      {
        source: '/developers/section/:folder/:slug*',
        destination: 'https://docs.twenty.com/developers/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/developers/:folder/:slug*',
        destination: 'https://docs.twenty.com/developers/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/developers/:slug',
        destination: 'https://docs.twenty.com/developers/:slug',
        permanent: true,
      },
      {
        source: '/twenty-ui',
        destination: 'https://docs.twenty.com/twenty-ui/introduction',
        permanent: true,
      },
      {
        source: '/twenty-ui/section/:folder/:slug*',
        destination: 'https://docs.twenty.com/twenty-ui/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/twenty-ui/:folder/:slug*',
        destination: 'https://docs.twenty.com/twenty-ui/:folder/:slug*',
        permanent: true,
      },
      {
        source: '/twenty-ui/:slug',
        destination: 'https://docs.twenty.com/twenty-ui/:slug',
        permanent: true,
      },

      // Renamed/restructured pages on the new website. Mappings derived
      // from the old twenty.com sitemap so existing inbound links and
      // search results keep working.
      {
        source: '/story',
        destination: '/why-twenty',
        permanent: true,
      },
      {
        source: '/legal/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/legal/terms',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/legal/dpa',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/case-studies/9-dots-story',
        destination: '/customers/9dots',
        permanent: true,
      },
      {
        source: '/case-studies/act-immi-story',
        destination: '/customers/act-education',
        permanent: true,
      },
      {
        source: '/case-studies/:slug*',
        destination: '/customers',
        permanent: true,
      },
      {
        source: '/implementation-services',
        destination: '/partners',
        permanent: true,
      },
      {
        source: '/onboarding-packages',
        destination: '/partners',
        permanent: true,
      },
    ];
  },
};

module.exports = withLinaria(nextConfig);
