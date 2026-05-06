import { localizeHref, stripLocale } from '../localize-href';

describe('localizeHref', () => {
  it('does not emit locale prefixes for locales the website does not publish yet', () => {
    expect(localizeHref('de-DE', '/pricing')).toBe('/pricing');
  });

  it('emits the URL-segment prefix (not the AppLocale) for published non-default locales', () => {
    expect(localizeHref('fr-FR', '/pricing')).toBe('/fr/pricing');
    expect(localizeHref('fr-FR', '/')).toBe('/fr');
  });

  it('strips the canonical /fr URL segment when re-localising to the default locale', () => {
    expect(localizeHref('en', '/fr/pricing')).toBe('/pricing');
    expect(localizeHref('en', '/fr')).toBe('/');
  });

  it('returns paths unprefixed for the default locale (English at root)', () => {
    expect(localizeHref('en', '/pricing')).toBe('/pricing');
    expect(localizeHref('en', '/')).toBe('/');
  });

  it('keeps the root path unprefixed for unpublished locales', () => {
    expect(localizeHref('de-DE', '/')).toBe('/');
  });

  it('preserves query strings and hash fragments', () => {
    expect(localizeHref('de-DE', '/customers?ref=hero#top')).toBe(
      '/customers?ref=hero#top',
    );
    expect(localizeHref('en', '/customers?ref=hero#top')).toBe(
      '/customers?ref=hero#top',
    );
  });

  it('strips a redundant /en prefix when targeting the default locale', () => {
    expect(localizeHref('en', '/en/why-twenty')).toBe('/why-twenty');
    expect(localizeHref('en', '/en')).toBe('/');
  });

  it('strips an /en-prefixed path when targeting an unpublished locale', () => {
    expect(localizeHref('de-DE', '/en/why-twenty')).toBe('/why-twenty');
    expect(localizeHref('de-DE', '/en')).toBe('/');
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

  it('handles a published locale segment immediately followed by a query string', () => {
    expect(localizeHref('en', '/en?ref=hero')).toBe('/?ref=hero');
    expect(localizeHref('en', '/fr?ref=hero')).toBe('/?ref=hero');
  });

  it('handles a published locale segment immediately followed by a hash fragment', () => {
    expect(localizeHref('en', '/en#anchor')).toBe('/#anchor');
    expect(localizeHref('en', '/fr#anchor')).toBe('/#anchor');
  });
});

describe('stripLocale', () => {
  it('removes a published-locale URL-segment prefix from the pathname', () => {
    expect(stripLocale('/en/why-twenty')).toBe('/why-twenty');
    expect(stripLocale('/fr/customers/9dots')).toBe('/customers/9dots');
  });

  it('returns the root path when the pathname is just the locale segment', () => {
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/fr')).toBe('/');
  });

  it('returns the pathname unchanged when no published locale prefix is present', () => {
    expect(stripLocale('/why-twenty')).toBe('/why-twenty');
    expect(stripLocale('/')).toBe('/');
    expect(stripLocale('/fr-FR/foo')).toBe('/fr-FR/foo');
    expect(stripLocale('/zh-CN')).toBe('/zh-CN');
  });

  it('returns the pathname unchanged when the input does not start with a slash', () => {
    expect(stripLocale('not-a-path')).toBe('not-a-path');
    expect(stripLocale('')).toBe('');
  });

  it('preserves query and hash when the locale segment is immediately followed by them', () => {
    expect(stripLocale('/en?ref=hero')).toBe('/?ref=hero');
    expect(stripLocale('/fr#anchor')).toBe('/#anchor');
    expect(stripLocale('/fr/customers?ref=hero#top')).toBe(
      '/customers?ref=hero#top',
    );
  });
});
