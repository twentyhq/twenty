import type { MessageDescriptor } from '@lingui/core';

import type { Article } from '@/lib/articles';
import type { LocalReleaseNote } from '@/lib/releases/types';

import { getSiteUrl } from './site-url';

type FaqEntryLike = {
  question: { text: MessageDescriptor };
  answer: { text: MessageDescriptor };
};

type JsonLdPrimitive = boolean | number | string | null;

export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

const serializeJsonLd = (data: JsonLdValue): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}

export const buildOrganizationJsonLd = (): JsonLdValue => {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Twenty',
    url: siteUrl,
    logo: `${siteUrl}/images/core/logo.svg`,
    sameAs: [
      'https://github.com/twentyhq/twenty',
      'https://www.linkedin.com/company/twenty',
      'https://x.com/twentycrm',
    ],
  };
};

export const buildSoftwareApplicationJsonLd = (): JsonLdValue => {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Twenty',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Customer Relationship Management',
    operatingSystem: 'Web',
    description:
      'Twenty is an open source CRM for teams that want a modern, customizable, and extensible customer platform.',
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      url: `${siteUrl}/pricing`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Twenty',
      url: siteUrl,
    },
  };
};

type RenderText = (descriptor: MessageDescriptor) => string;

export const buildFaqPageJsonLd = (
  questions: readonly FaqEntryLike[],
  renderText: RenderText,
): JsonLdValue => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((question) => ({
    '@type': 'Question',
    name: renderText(question.question.text),
    acceptedAnswer: {
      '@type': 'Answer',
      text: renderText(question.answer.text),
    },
  })),
});

const extractReleaseHeadline = (note: LocalReleaseNote): string => {
  const match = note.content.match(/^\s*#\s+(.+?)\s*$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  return `Twenty ${note.release}`;
};

export const buildReleaseListJsonLd = (
  notes: readonly LocalReleaseNote[],
): JsonLdValue => {
  const siteUrl = getSiteUrl();
  const releasesUrl = `${siteUrl}/releases`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Twenty Releases',
    url: releasesUrl,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: notes.length,
    itemListElement: notes.map((note, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${releasesUrl}#${note.release}`,
      item: {
        '@type': 'TechArticle',
        '@id': `${releasesUrl}#${note.release}`,
        headline: extractReleaseHeadline(note),
        name: `Twenty ${note.release}`,
        url: `${releasesUrl}#${note.release}`,
        ...(note.date ? { datePublished: note.date } : {}),
        author: {
          '@type': 'Organization',
          name: 'Twenty',
          url: siteUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Twenty',
          url: siteUrl,
        },
      },
    })),
  };
};

export const buildArticleListJsonLd = (
  posts: readonly Article[],
): JsonLdValue => {
  const siteUrl = getSiteUrl();
  const articlesUrl = `${siteUrl}/articles`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Twenty Articles',
    url: articlesUrl,
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: `${articlesUrl}/${post.slug}`,
      datePublished: post.date,
      author: {
        '@type': 'Organization',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Twenty',
        url: siteUrl,
      },
    })),
  };
};

export const buildArticleJsonLd = (post: Article): JsonLdValue => {
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/articles/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: postUrl,
    mainEntityOfPage: postUrl,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Twenty',
      url: siteUrl,
    },
  };
};
