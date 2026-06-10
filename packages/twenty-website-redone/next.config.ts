import path from 'path';
import withLinaria, { type LinariaConfig } from 'next-with-linaria';

// Bundler decision: Next 16 defaults dev and build to Turbopack, and
// next-with-linaria@1.3 branches on process.env.TURBOPACK to apply its
// Turbopack loader config — the same combination the original twenty-website
// already runs in dev. Webpack stays available behind `next dev --webpack`
// as the escape hatch if a wyw-in-js edge case surfaces.
const nextConfig: LinariaConfig = {
  reactCompiler: true,
  linaria: {
    configFile: path.resolve(__dirname, 'wyw-in-js.config.cjs'),
  },
};

export default withLinaria(nextConfig);
