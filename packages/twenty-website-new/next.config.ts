import withLinaria, { type LinariaConfig } from 'next-with-linaria';

const nextConfig: LinariaConfig = { reactCompiler: true };

module.exports = withLinaria(nextConfig);
