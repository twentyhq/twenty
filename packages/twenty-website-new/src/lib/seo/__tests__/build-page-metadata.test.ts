import { buildPageMetadata } from '@/lib/seo';

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const descriptor = (message: string) => ({ id: message, message });

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
      title: descriptor('Product | Twenty'),
      description: descriptor('Product page description.'),
    });

    expect(metadata.title).toEqual({ absolute: 'Product | Twenty' });
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

  it('falls back to the source canonical for locales the website does not publish', () => {
    const metadata = buildPageMetadata({
      locale: 'de-DE',
      path: '/product',
      title: descriptor('t'),
      description: descriptor('d'),
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/product' });
    expect(metadata.openGraph).toMatchObject({ locale: 'en' });
  });

  it('resolves Lingui message descriptors before emitting SEO fields', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/',
      title: {
        id: 'seo.test.title',
        message: 'Twenty | #1 open source CRM',
      },
      description: {
        id: 'seo.test.description',
        message: 'The #1 open source CRM for modern teams.',
      },
    });

    expect(metadata.title).toEqual({
      absolute: 'Twenty | #1 open source CRM',
    });
    expect(metadata.description).toBe(
      'The #1 open source CRM for modern teams.',
    );
    expect(metadata.openGraph).toMatchObject({
      title: 'Twenty | #1 open source CRM',
      description: 'The #1 open source CRM for modern teams.',
    });
  });

  it('emits hreflang alternates only for published website locales', () => {
    const metadata = buildPageMetadata({
      locale: 'fr-FR',
      path: '/pricing',
      title: descriptor('t'),
      description: descriptor('d'),
    });

    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.en).toBe('/pricing');
    expect(languages?.['fr-FR']).toBe('/fr-FR/pricing');
    expect(languages?.['zh-CN']).toBeUndefined();
    expect(languages?.['x-default']).toBe('/pricing');
  });

  it('omits pseudo locales from hreflang language alternates', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/pricing',
      title: descriptor('t'),
      description: descriptor('d'),
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
      title: descriptor('t'),
      description: descriptor('d'),
    });

    expect(metadata.alternates).toMatchObject({ canonical: '/' });
    const languages = metadata.alternates?.languages as
      | Record<string, string>
      | undefined;
    expect(languages?.['de-DE']).toBeUndefined();
    expect(languages?.['fr-FR']).toBe('/fr-FR');
    expect(languages?.en).toBe('/');
    expect(languages?.['x-default']).toBe('/');
  });

  it('absolutises a root-relative ogImage against the configured site URL', () => {
    const metadata = buildPageMetadata({
      locale: 'en',
      path: '/x',
      title: descriptor('t'),
      description: descriptor('d'),
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
      title: descriptor('t'),
      description: descriptor('d'),
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
      title: descriptor('Default title'),
      description: descriptor('Default description'),
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
      title: descriptor('t'),
      description: descriptor('d'),
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
      title: descriptor('t'),
      description: descriptor('d'),
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
      title: descriptor('t'),
      description: descriptor('d'),
      extend: {
        robots: { index: false, follow: false },
      },
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toMatchObject({ canonical: '/x' });
  });
});
