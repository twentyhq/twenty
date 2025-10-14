/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      // Old URL structure redirects
      {
        source: '/user-guide/section/functions/emails',
        destination: '/user-guide/section/integrations/emails',
        permanent: true,
      },
      {
        source: '/user-guide/section/objects/fields',
        destination: '/user-guide/section/data-model/fields',
        permanent: true,
      },
      {
        source: '/user-guide/section/objects/views-sort-filter',
        destination: '/user-guide/section/views/views-sort-filter',
        permanent: true,
      },
      {
        source: '/user-guide/section/objects',
        destination: '/user-guide/section/data-model/standard-objects',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
