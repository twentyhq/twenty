import { localizeHref, stripLocale } from '../localize-href';

describe('localizeHref', () => {
  it('prefixes the active locale onto an internal absolute path', () => {
    expect(localizeHref('fr-FR', '/pricing')).toBe('/fr-FR/pricing');
  });

  it('prefixes the active locale onto the root path', () => {
    expect(localizeHref('fr-FR', '/')).toBe('/fr-FR/');
  });

  it('preserves query strings and hash fragments', () => {
    expect(localizeHref('de-DE', '/customers?ref=hero#top')).toBe(
      '/de-DE/customers?ref=hero#top',
    );
  });

  it('does not double-prefix paths that already start with a known locale', () => {
    expect(localizeHref('fr-FR', '/en/why-twenty')).toBe('/en/why-twenty');
    expect(localizeHref('fr-FR', '/fr-FR/pricing')).toBe('/fr-FR/pricing');
  });

  it('passes external https URLs through unchanged', () => {
    expect(localizeHref('en', 'https://docs.twenty.com')).toBe(
      'https://docs.twenty.com',
    );
  });

  it('passes protocol-relative URLs through unchanged', () => {
    expect(localizeHref('en', '//cdn.twenty.com/asset.png')).toBe(
      '//cdn.twenty.com/asset.png',
    );
  });

  it('passes mailto and tel links through unchanged', () => {
    expect(localizeHref('en', 'mailto:contact@twenty.com')).toBe(
      'mailto:contact@twenty.com',
    );
    expect(localizeHref('en', 'tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('passes hash-only and relative hrefs through unchanged', () => {
    expect(localizeHref('en', '#top')).toBe('#top');
    expect(localizeHref('en', './sibling')).toBe('./sibling');
    expect(localizeHref('en', '../parent')).toBe('../parent');
  });
});

describe('stripLocale', () => {
  it('removes a known locale prefix from the pathname', () => {
    expect(stripLocale('/en/why-twenty')).toBe('/why-twenty');
    expect(stripLocale('/fr-FR/customers/9dots')).toBe('/customers/9dots');
  });

  it('returns the root path when the pathname is just the locale segment', () => {
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/zh-CN')).toBe('/');
  });

  it('returns the pathname unchanged when no known locale prefix is present', () => {
    expect(stripLocale('/why-twenty')).toBe('/why-twenty');
    expect(stripLocale('/')).toBe('/');
  });

  it('returns the pathname unchanged when the input does not start with a slash', () => {
    expect(stripLocale('not-a-path')).toBe('not-a-path');
    expect(stripLocale('')).toBe('');
  });
});
