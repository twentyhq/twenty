import path from 'path';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';

import { localeToUrlSegment } from './src/platform/i18n/locale-to-url-segment';
import { buildLocaleRewrites } from './src/platform/routing/locale-rewrite-patterns';
import { WEBSITE_LOCALE_LIST } from './src/platform/i18n/website-locale-list';

// Bundler decision: Next 16 defaults dev and build to Turbopack, and
// next-with-linaria@1.3 branches on process.env.TURBOPACK to apply its
// Turbopack loader config — the same combination the original twenty-website
// already runs in dev. Webpack stays available behind `next dev --webpack`
// as the escape hatch if a wyw-in-js edge case surfaces.
const DEPLOYED_LOCALE_URL_SEGMENTS =
  WEBSITE_LOCALE_LIST.map(localeToUrlSegment);

const nextConfig: LinariaConfig = {
  reactCompiler: true,
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
  // Clean public URLs: the source locale is unprefixed, other locales get a
  // short segment. Rewrites map unprefixed paths onto the internal /[locale]
  // tree; redirects canonicalize away explicit source-locale prefixes.
  async rewrites() {
    return {
      beforeFiles: buildLocaleRewrites(DEPLOYED_LOCALE_URL_SEGMENTS),
    };
  },
  async redirects() {
    return [
      { source: '/en', destination: '/', statusCode: 301 },
      { source: '/en/:path*', destination: '/:path*', statusCode: 301 },
    ];
  },
};

export default withLinaria(nextConfig);

// Binds the Cloudflare dev context (R2 incremental cache, env vars) into
// `next dev` so local runs mirror the deployed OpenNext worker.
initOpenNextCloudflareForDev();
