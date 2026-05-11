import { getPublishedArticles } from '@/lib/articles';

import type { WebsiteRoute } from './types';

const descriptorFromText = (message: string) => ({ id: message, message });

const publishedArticles = getPublishedArticles();

export const ARTICLE_ROUTES: readonly WebsiteRoute[] =
  publishedArticles.length === 0
    ? []
    : [
        {
          id: 'articles',
          path: '/articles',
          title: descriptorFromText(
            'Twenty Articles | Open Source CRM Insights',
          ),
          description: descriptorFromText(
            'Ideas from the team building Twenty on open source CRM, customer data, GTM systems, and building software that lasts.',
          ),
          changeFrequency: 'weekly',
          priority: 0.8,
          indexed: true,
          localeMode: 'source',
        },
        ...publishedArticles.map(
          (article): WebsiteRoute => ({
            id: `articles:${article.slug}`,
            path: `/articles/${article.slug}`,
            title: descriptorFromText(`${article.title} | Twenty Articles`),
            description: descriptorFromText(article.description),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            indexed: true,
            localeMode: 'source' as const,
          }),
        ),
      ];
