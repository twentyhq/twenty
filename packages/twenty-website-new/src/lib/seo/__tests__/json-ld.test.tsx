import {
  buildFaqPageJsonLd,
  buildOrganizationJsonLd,
  buildReleaseListJsonLd,
  buildSoftwareApplicationJsonLd,
} from '@/lib/seo';

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

const descriptor = (message: string) => ({ id: message, message });

beforeEach(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = 'https://example.test';
});

afterAll(() => {
  process.env.NEXT_PUBLIC_WEBSITE_URL = ORIGINAL_SITE_URL;
});

describe('buildOrganizationJsonLd', () => {
  it('emits the canonical Organization shape with the configured site URL', () => {
    const data = buildOrganizationJsonLd();

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Twenty',
      url: 'https://example.test',
      logo: 'https://example.test/images/core/logo.svg',
    });
  });
});

describe('buildSoftwareApplicationJsonLd', () => {
  it('declares Twenty as a CRM SoftwareApplication with the pricing page as its Offer URL', () => {
    const data = buildSoftwareApplicationJsonLd() as Record<string, unknown>;

    expect(data['@type']).toBe('SoftwareApplication');
    expect(data['applicationCategory']).toBe('BusinessApplication');
    expect(data['applicationSubCategory']).toBe(
      'Customer Relationship Management',
    );
    expect(data['offers']).toMatchObject({
      url: 'https://example.test/pricing',
    });
  });
});

describe('buildFaqPageJsonLd', () => {
  const renderText = (d: { message?: string; id: string }) => d.message ?? d.id;

  it('produces a FAQPage with one Question per input, each carrying an Answer', () => {
    const questions = [
      {
        question: { fontFamily: 'sans' as const, text: descriptor('Q1?') },
        answer: { text: descriptor('A1.') },
      },
      {
        question: { fontFamily: 'sans' as const, text: descriptor('Q2?') },
        answer: { text: descriptor('A2.') },
      },
    ];

    const data = buildFaqPageJsonLd(questions, renderText) as {
      '@type': string;
      mainEntity: Array<Record<string, unknown>>;
    };

    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(2);
    expect(data.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Q1?',
      acceptedAnswer: { '@type': 'Answer', text: 'A1.' },
    });
    expect(data.mainEntity[1]).toMatchObject({
      name: 'Q2?',
      acceptedAnswer: { text: 'A2.' },
    });
  });

  it('renders descriptors through the supplied renderText, not the descriptor id', () => {
    const data = buildFaqPageJsonLd(
      [
        {
          question: {
            text: { id: 'faq.q', message: 'Resolved question' },
          },
          answer: { text: { id: 'faq.a', message: 'Resolved answer' } },
        },
      ],
      renderText,
    ) as { mainEntity: Array<Record<string, unknown>> };

    expect(data.mainEntity[0]).toMatchObject({
      name: 'Resolved question',
      acceptedAnswer: { text: 'Resolved answer' },
    });
  });
});

describe('buildReleaseListJsonLd', () => {
  it('builds a descending ItemList of TechArticles, anchored to /releases#<version>', () => {
    const notes = [
      {
        slug: '1.18.0',
        release: '1.18.0',
        date: '2026-04-01',
        content: '# Highlight one\n\nBody text\n\n# Highlight two\n',
      },
      {
        slug: '1.17.0',
        release: '1.17.0',
        date: '2026-03-15',
        content: '## Smaller heading\n\n# Real headline\n',
      },
    ];

    const data = buildReleaseListJsonLd(notes) as {
      '@type': string;
      numberOfItems: number;
      itemListElement: Array<Record<string, unknown>>;
    };

    expect(data['@type']).toBe('ItemList');
    expect(data.numberOfItems).toBe(2);
    expect(data.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      url: 'https://example.test/releases#1.18.0',
      item: {
        '@type': 'TechArticle',
        '@id': 'https://example.test/releases#1.18.0',
        headline: 'Highlight one',
        name: 'Twenty 1.18.0',
        datePublished: '2026-04-01',
      },
    });
  });

  it('falls back to "Twenty <release>" as the headline when the body has no h1', () => {
    const data = buildReleaseListJsonLd([
      {
        slug: '0.1.0',
        release: '0.1.0',
        date: '2025-01-01',
        content: 'Just paragraphs, no headings.\n',
      },
    ]) as { itemListElement: Array<Record<string, { headline: string }>> };

    expect(data.itemListElement[0].item.headline).toBe('Twenty 0.1.0');
  });

  it('omits datePublished when the frontmatter date is missing', () => {
    const data = buildReleaseListJsonLd([
      {
        slug: '0.2.0',
        release: '0.2.0',
        date: '',
        content: '# Headline\n',
      },
    ]) as {
      itemListElement: Array<Record<string, Record<string, unknown>>>;
    };

    expect(data.itemListElement[0].item).not.toHaveProperty('datePublished');
  });
});
