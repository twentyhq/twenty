import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';
import path from 'path';

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

// Skew protection: CI sets DEPLOYMENT_ID at build time so it's baked into
// prerendered HTML + the RSC payloads. The Worker reads the same value at
// runtime (via the worker env var) and routes mismatched requests to the
// matching older Worker version via its preview URL. Required whenever
// open-next.config.ts has cloudflare.skewProtection.enabled.
const deploymentId = process.env.DEPLOYMENT_ID;

const nextConfig: LinariaConfig = {
  deploymentId,
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
  linaria: {
    configFile: path.resolve(__dirname, 'wyw-in-js.config.cjs'),
  },
  experimental: {
    swcPlugins: [
      [
        '@lingui/swc-plugin',
        {
          runtimeModules: {
            i18n: ['@lingui/core', 'i18n'],
            trans: ['@lingui/react', 'Trans'],
          },
        },
      ],
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
        destination: '/dpa',
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

export default withLinaria(nextConfig);

// Binds the Cloudflare dev context (R2 incremental cache, env vars) into
// `next dev` so local runs mirror the deployed OpenNext worker.
initOpenNextCloudflareForDev();
