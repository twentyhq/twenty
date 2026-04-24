import path from 'path';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';

/**
 * Site-wide HTTP security headers. Documented in ARCHITECTURE.md §12.
 *
 * What we ship today:
 * - HSTS (2 years, subdomains, preload-eligible). Removing this is a
 *   one-way door — once browsers cache it, downgrading is hard. Keep
 *   `preload` in the value, but submit to hstspreload.org explicitly
 *   only after confirming every subdomain (docs.*, api.*, …) serves
 *   over HTTPS.
 * - `X-Content-Type-Options: nosniff` to suppress MIME-type guessing.
 * - `Referrer-Policy: strict-origin-when-cross-origin` (Next's default
 *   for navigations is the same; pinning it as a header covers
 *   sub-resources too).
 * - `Permissions-Policy` denying camera / microphone / geolocation /
 *   payment APIs the marketing site has no business asking for.
 * - `X-Frame-Options: DENY` and `frame-ancestors 'none'` — defence in
 *   depth against clickjacking. The site is not embedded anywhere.
 *
 * What we explicitly *don't* ship yet:
 * - A full `Content-Security-Policy` with `script-src` / `style-src`.
 *   Cal.com (`@calcom/embed-react`), Stripe Checkout, and Lottie all
 *   inject external assets at runtime; getting CSP right requires
 *   per-vendor nonce/hash plumbing and is tracked separately.
 *
 * Verify locally with `curl -sI http://localhost:3000/ | head -40`.
 */
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS.map((h) => ({ ...h })),
      },
    ];
  },
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
