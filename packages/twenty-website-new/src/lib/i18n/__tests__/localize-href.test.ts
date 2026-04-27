import { localizeHref, stripLocale } from '../localize-href';

describe('localizeHref', () => {
  it('prefixes a non-default locale onto an internal absolute path', () => {
    expect(localizeHref('fr-FR', '/pricing')).toBe('/fr-FR/pricing');
  });

  it('returns paths unprefixed for the default locale (English at root)', () => {
    expect(localizeHref('en', '/pricing')).toBe('/pricing');
    expect(localizeHref('en', '/')).toBe('/');
  });

  it('prefixes a non-default locale onto the root path', () => {
    expect(localizeHref('fr-FR', '/')).toBe('/fr-FR/');
  });

  it('preserves query strings and hash fragments', () => {
    expect(localizeHref('de-DE', '/customers?ref=hero#top')).toBe(
      '/de-DE/customers?ref=hero#top',
    );
    expect(localizeHref('en', '/customers?ref=hero#top')).toBe(
      '/customers?ref=hero#top',
    );
  });

  it('does not double-prefix paths that already start with a non-default locale', () => {
    expect(localizeHref('fr-FR', '/de-DE/why-twenty')).toBe(
      '/de-DE/why-twenty',
    );
    expect(localizeHref('fr-FR', '/fr-FR/pricing')).toBe('/fr-FR/pricing');
  });

  it('strips a redundant /en prefix when targeting the default locale', () => {
    expect(localizeHref('en', '/en/why-twenty')).toBe('/why-twenty');
    expect(localizeHref('en', '/en')).toBe('/');
  });

  it('rewrites an /en-prefixed path onto the active non-default locale', () => {
    expect(localizeHref('fr-FR', '/en/why-twenty')).toBe('/fr-FR/why-twenty');
    expect(localizeHref('fr-FR', '/en')).toBe('/fr-FR/');
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

  it('handles a locale segment immediately followed by a query string', () => {
    expect(localizeHref('en', '/en?ref=hero')).toBe('/?ref=hero');
    expect(localizeHref('fr-FR', '/en?ref=hero')).toBe('/fr-FR/?ref=hero');
    expect(localizeHref('fr-FR', '/de-DE?ref=hero')).toBe('/de-DE?ref=hero');
  });

  it('handles a locale segment immediately followed by a hash fragment', () => {
    expect(localizeHref('en', '/en#anchor')).toBe('/#anchor');
    expect(localizeHref('fr-FR', '/en#anchor')).toBe('/fr-FR/#anchor');
    expect(localizeHref('fr-FR', '/de-DE#anchor')).toBe('/de-DE#anchor');
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

  it('preserves query and hash when the locale segment is immediately followed by them', () => {
    expect(stripLocale('/en?ref=hero')).toBe('/?ref=hero');
    expect(stripLocale('/fr-FR#anchor')).toBe('/#anchor');
    expect(stripLocale('/fr-FR/customers?ref=hero#top')).toBe(
      '/customers?ref=hero#top',
    );
  });
});
