import { pathToRegexp } from 'next/dist/compiled/path-to-regexp';

import { buildLocaleRewrites } from './locale-rewrite-patterns';

const REWRITES = buildLocaleRewrites(['en', 'fr', 'es']);

// Resolve a path the way Next's beforeFiles rewrites do: first matching
// source wins; no match means the path passes through untouched.
const resolve = (path: string): string => {
  for (const rewrite of REWRITES) {
    const keys: { name: string | number }[] = [];
    const regexp = pathToRegexp(rewrite.source, keys);
    const match = regexp.exec(path);
    if (!match) continue;

    let destination = rewrite.destination;
    keys.forEach((key, index) => {
      const value = match[index + 1];
      destination = destination
        .replace(`:${String(key.name)}+`, value)
        .replace(`:${String(key.name)}`, value);
    });
    return destination;
  }
  return path;
};

describe('locale rewrites', () => {
  it('should rewrite the root to the source locale', () => {
    expect(resolve('/')).toBe('/en');
  });

  it('should rewrite unprefixed pages to the source locale', () => {
    expect(resolve('/pricing')).toBe('/en/pricing');
    expect(resolve('/why-twenty')).toBe('/en/why-twenty');
  });

  it('should rewrite unprefixed nested paths to the source locale', () => {
    expect(resolve('/articles/launch-week')).toBe('/en/articles/launch-week');
    expect(resolve('/customers/acme')).toBe('/en/customers/acme');
  });

  it('should leave locale-prefixed paths untouched', () => {
    expect(resolve('/fr')).toBe('/fr');
    expect(resolve('/fr/pricing')).toBe('/fr/pricing');
    expect(resolve('/es/articles/launch-week')).toBe(
      '/es/articles/launch-week',
    );
  });

  it('should leave asset directories untouched (rewrites run before public/)', () => {
    expect(resolve('/lottie/stepper/stepper.lottie')).toBe(
      '/lottie/stepper/stepper.lottie',
    );
    expect(resolve('/models/hourglass.glb')).toBe('/models/hourglass.glb');
  });

  it('should leave reserved prefixes untouched', () => {
    expect(resolve('/api/stats')).toBe('/api/stats');
    expect(resolve('/_next/static/chunk.js')).toBe('/_next/static/chunk.js');
    expect(resolve('/images/menu/why.webp')).toBe('/images/menu/why.webp');
    expect(resolve('/fonts/aleo.woff2')).toBe('/fonts/aleo.woff2');
  });

  it('should leave well-known files untouched', () => {
    expect(resolve('/favicon.ico')).toBe('/favicon.ico');
    expect(resolve('/robots.txt')).toBe('/robots.txt');
    expect(resolve('/sitemap.xml')).toBe('/sitemap.xml');
    expect(resolve('/og-image.png')).toBe('/og-image.png');
  });

  it('should leave the .well-known directory untouched, including extensionless files', () => {
    expect(resolve('/.well-known/security.txt')).toBe(
      '/.well-known/security.txt',
    );
    expect(resolve('/.well-known/openai-apps-challenge')).toBe(
      '/.well-known/openai-apps-challenge',
    );
  });
});
