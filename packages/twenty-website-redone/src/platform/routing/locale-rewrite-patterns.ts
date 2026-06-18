// Pure builder for the locale rewrites in next.config.ts — kept here so the
// patterns are unit-tested (see the .test file) and have one home. The
// catch-all design means new pages and dynamic families need NO rewrite
// changes: any path that is not a deployed locale prefix, a reserved
// prefix, or a file with an extension rewrites to the source locale.
// Every public/ asset directory must be listed: beforeFiles rewrites run
// BEFORE the filesystem, so an unlisted prefix gets rewritten to /en/* and
// 404s (the old site ships this bug; its CDN masks it in production).
const RESERVED_PREFIXES = [
  'api',
  '_next',
  'images',
  'fonts',
  'lottie',
  'models',
];

export const buildLocaleRewrites = (
  localeSegments: readonly string[],
): { source: string; destination: string }[] => {
  const localeAlternation = localeSegments.join('|');
  const reservedAlternation = RESERVED_PREFIXES.join('|');
  const terminalExclusions = [
    ...localeSegments.map((segment) => `${segment}$|${segment}/`),
    ...RESERVED_PREFIXES,
    '_next/static',
    '_next/image',
    'favicon\\.ico',
    'robots\\.txt',
    'sitemap\\.xml',
    '.+\\..+',
  ].join('|');

  return [
    { source: '/', destination: '/en' },
    {
      source: `/:first((?!(?:${localeAlternation}|${reservedAlternation})(?=/))[^/.]+)/:rest+`,
      destination: '/en/:first/:rest+',
    },
    {
      source: `/:rest((?!${terminalExclusions}).+)`,
      destination: '/en/:rest',
    },
  ];
};
