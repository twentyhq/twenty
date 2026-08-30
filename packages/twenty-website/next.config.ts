import { type NextConfig } from 'next';

import { WEBSITE_LOCALE_LIST } from './src/platform/i18n/website-locale-list';
import { buildLocaleRewrites } from './src/platform/routing/locale-rewrite-patterns';

const SECURITY_HEADERS: { key: string; value: string }[] = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/(images|illustrations|lottie)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Clean public URLs: the source locale is unprefixed, other locales get a
  // short segment. Rewrites map unprefixed paths onto the internal /[locale]
  // tree; redirects canonicalize away explicit source-locale prefixes.
  async rewrites() {
    return {
      beforeFiles: buildLocaleRewrites(WEBSITE_LOCALE_LIST),
    };
  },
  async redirects() {
    return [
      // Canonicalise www → apex. Host-based; fires before any locale logic.
      // The root-path rule must come before the :path* one — Next.js's
      // path-to-regexp leaves a literal `:path*` in the Location header
      // when the parameter matches empty against an absolute destination.
      {
        source: '/',
        has: [{ type: 'host', value: 'www.twenty.com' }],
        destination: 'https://twenty.com/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.twenty.com' }],
        destination: 'https://twenty.com/:path*',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'www.twenty-main.com' }],
        destination: 'https://twenty-main.com/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.twenty-main.com' }],
        destination: 'https://twenty-main.com/:path*',
        permanent: true,
      },
      // Strip the source-locale prefix: /en/foo → /foo (301).
      { source: '/en', destination: '/', statusCode: 301 },
      { source: '/en/:path*', destination: '/:path*', statusCode: 301 },
      // /partners/list folded into the lead page, whose directory zone is the
      // same grid. Both the unprefixed and the locale-prefixed URLs were in the
      // sitemap, so both need the 308.
      { source: '/partners/list', destination: '/partners', permanent: true },
      {
        source: `/:locale(${WEBSITE_LOCALE_LIST.join('|')})/partners/list`,
        destination: '/:locale/partners',
        permanent: true,
      },
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
        source: '/resources/why-twenty',
        destination: '/why-twenty',
        permanent: true,
      },
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

export default nextConfig;
