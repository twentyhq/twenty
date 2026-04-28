import { buildPageMetadata } from '@/lib/seo';

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = 'https://example.test';
});

afterAll(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = ORIGINAL_SITE_URL;
});

describe('buildPageMetadata', () => {
  it('emits an unprefixed canonical for the default locale (English at root)', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/product',
      title: 'Product | Twenty',
      description: 'Product page description.',
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/product' });
    expect(metadata.openGraph).toMatchObject({
      title: 'Product | Twenty',
      description: 'Product page description.',
      url: '/product',
      siteName: 'Twenty',
      locale: 'en',
      type: 'website',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Product | Twenty',
      site: '@twentycrm',
    });
  });

  it('emits a prefixed canonical for non-default locales', () => {
    const metadata = buildPageMetadata({
      locale: 'fr-FR',
      path: '/product',
      title: 't',
      description: 'd',
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/fr-FR/product' });
  });

  it('emits hreflang language alternates: English unprefixed, others prefixed, x-default unprefixed', () => {
    const metadata = buildPageMetadata({
      locale: 'fr-FR',
      path: '/pricing',
      title: 't',
      description: 'd',
    });

    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.en).toBe('/pricing');
    expect(languages?.['fr-FR']).toBe('/fr-FR/pricing');
    expect(languages?.['zh-CN']).toBe('/zh-CN/pricing');
    expect(languages?.['x-default']).toBe('/pricing');
  });

  it('omits pseudo locales from hreflang language alternates', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/pricing',
      title: 't',
      description: 'd',
    });

    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.['pseudo-en']).toBeUndefined();
  });

  it('localizes the root path correctly (no trailing slash duplication)', () => {
    const metadata = buildPageMetadata({
      locale: 'de-DE',
      path: '/',
      title: 't',
      description: 'd',
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/de-DE' });
    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.['de-DE']).toBe('/de-DE');
    expect(languages?.en).toBe('/');
    expect(languages?.['x-default']).toBe('/');
  });

  it('absolutises a root-relative ogImage against the configured site URL', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 't',
      description: 'd',
      ogImage: '/og/x.png',
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://example.test/og/x.png' },
    ]);
    expect(metadata.twitter?.images).toEqual(['https://example.test/og/x.png']);
  });

  it('passes through an absolute ogImage unchanged', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 't',
      description: 'd',
      ogImage: 'https://cdn.example/og.png',
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://cdn.example/og.png' },
    ]);
  });

  it('deep-merges openGraph: extending title preserves description, url, and images', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 'Default title',
      description: 'Default description',
      ogImage: '/og/default.png',
      extend: {
        openGraph: { title: 'Override OG title' },
      },
    });

    expect(metadata.openGraph).toMatchObject({
      title: 'Override OG title',
      description: 'Default description',
      url: '/x',
      siteName: 'Twenty',
      images: [{ url: 'https://example.test/og/default.png' }],
    });
  });

  it('deep-merges twitter: extending card preserves handle, title, images', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 't',
      description: 'd',
      ogImage: '/og/x.png',
      extend: {
        twitter: { card: 'summary' },
      },
    });

    expect(metadata.twitter).toMatchObject({
      card: 'summary',
      title: 't',
      site: '@twentycrm',
      creator: '@twentycrm',
      images: ['https://example.test/og/x.png'],
    });
  });

  it('deep-merges alternates so canonical and languages survive an override of one field', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 't',
      description: 'd',
      extend: {
        alternates: { canonical: '/custom-canonical' },
      },
    });

    expect(metadata.alternates).toMatchObject({
      canonical: '/custom-canonical',
    });
    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.en).toBe('/x');
  });

  it('shallow-merges unrelated top-level keys (e.g. robots)', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: 't',
      description: 'd',
      extend: {
        robots: { index: false, follow: false },
      },
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toMatchObject({ canonical: '/x' });
  });
});
