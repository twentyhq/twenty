import path from 'path';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';
import { APP_LOCALES } from 'twenty-shared/translations';

// Locale URL segments that are actually served (others are normalised away).
// Mirrors LOCALE_BY_URL_SEGMENT keys in src/lib/i18n/utils/website-locale-segments.ts.
const DEPLOYED_LOCALE_URL_SEGMENTS = ['en', 'fr'] as const;

// Raw locale codes (e.g. fr-FR, de-DE) that should redirect to the un-prefixed
// path. Excludes pseudo-* locales and the deployed URL segments themselves.
const RAW_LOCALE_PREFIXES_TO_STRIP = (
  Object.values(APP_LOCALES) as string[]
).filter(
  (locale) =>
    !locale.startsWith('pseudo-') &&
    !(DEPLOYED_LOCALE_URL_SEGMENTS as readonly string[]).includes(locale),
);

const SECURITY_HEADERS = [
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
] as const;

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
        headers: SECURITY_HEADERS.map((h) => ({ ...h })),
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
  async rewrites() {
    return {
      beforeFiles: [
        // Root rewrites to the source locale.
        { source: '/', destination: '/en' },
        // Any path that isn't already locale-prefixed (en/, fr/), an internal
        // Next.js path, a static asset folder, or a file with an extension
        // rewrites to the source locale prefix. Mirrors proxy.ts Rule 4.
        {
          source:
            '/:rest((?!en$|en/|fr$|fr/|api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|illustrations|lottie|fonts|.+\\..+).+)',
          destination: '/en/:rest',
        },
      ],
    };
  },
  async redirects() {
    return [
      // Canonicalise www → apex. Host-based; fires before any locale logic.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.twenty.com' }],
        destination: 'https://twenty.com/:path*',
        permanent: true,
      },
      // Strip the source-locale prefix: /en/foo → /foo (301). Mirrors proxy.ts Rule 1.
      { source: '/en', destination: '/', statusCode: 301 },
      { source: '/en/:path*', destination: '/:path*', statusCode: 301 },
      // Normalise raw locale codes that aren't deployed URL segments
      // (e.g. /fr-FR/foo → /foo, /de-DE/foo → /foo). Mirrors proxy.ts Rule 3.
      ...RAW_LOCALE_PREFIXES_TO_STRIP.flatMap((locale) => [
        { source: `/${locale}`, destination: '/', permanent: true },
        {
          source: `/${locale}/:path*`,
          destination: '/:path*',
          permanent: true,
        },
      ]),
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

initOpenNextCloudflareForDev();

module.exports = withLinaria(nextConfig);
