import { localizeHref } from './localize-href';
import { stripLocale } from './strip-locale';

describe('localizeHref', () => {
  it('leaves source-locale hrefs unprefixed', () => {
    expect(localizeHref('en', '/pricing')).toBe('/pricing');
  });

  it('prefixes non-source locales with their url segment', () => {
    expect(localizeHref('fr-FR', '/pricing')).toBe('/fr/pricing');
    expect(localizeHref('fr-FR', '/')).toBe('/fr');
  });

  it('re-localizes an already-prefixed href', () => {
    expect(localizeHref('es-ES', '/fr/pricing')).toBe('/es/pricing');
    expect(localizeHref('en', '/fr/pricing')).toBe('/pricing');
  });

  it('preserves query strings and hashes', () => {
    expect(localizeHref('fr-FR', '/pricing?seat=5#faq')).toBe(
      '/fr/pricing?seat=5#faq',
    );
  });

  it('passes through external and protocol-relative urls', () => {
    expect(localizeHref('fr-FR', 'https://example.com/a')).toBe(
      'https://example.com/a',
    );
    expect(localizeHref('fr-FR', '//cdn.example.com/x')).toBe(
      '//cdn.example.com/x',
    );
  });
});

describe('stripLocale', () => {
  it('removes a known locale prefix', () => {
    expect(stripLocale('/fr/pricing')).toBe('/pricing');
    expect(stripLocale('/fr')).toBe('/');
  });

  it('leaves unprefixed paths alone', () => {
    expect(stripLocale('/pricing')).toBe('/pricing');
  });
});
