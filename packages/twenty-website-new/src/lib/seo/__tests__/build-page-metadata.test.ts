import { buildPageMetadata } from '@/lib/seo';

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = 'https://example.test';
});

afterAll(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = ORIGINAL_SITE_URL;
});

describe('buildPageMetadata', () => {
  it('produces a baseline with canonical, openGraph, and twitter populated', () => {
    const metadata = buildPageMetadata({
      path: '/product',
      title: 'Product | Twenty',
      description: 'Product page description.',
    });

    expect(metadata.alternates).toEqual({ canonical: '/product' });
    expect(metadata.openGraph).toMatchObject({
      title: 'Product | Twenty',
      description: 'Product page description.',
      url: '/product',
      siteName: 'Twenty',
      type: 'website',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Product | Twenty',
      site: '@twentycrm',
    });
  });

  it('absolutises a root-relative ogImage against the configured site URL', () => {
    const metadata = buildPageMetadata({
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

  it('deep-merges alternates so canonical survives a languages override', () => {
    const metadata = buildPageMetadata({
      path: '/x',
      title: 't',
      description: 'd',
      extend: {
        alternates: { languages: { fr: '/fr/x' } },
      },
    });

    expect(metadata.alternates).toEqual({
      canonical: '/x',
      languages: { fr: '/fr/x' },
    });
  });

  it('shallow-merges unrelated top-level keys (e.g. robots)', () => {
    const metadata = buildPageMetadata({
      path: '/x',
      title: 't',
      description: 'd',
      extend: {
        robots: { index: false, follow: false },
      },
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toEqual({ canonical: '/x' });
  });
});
