import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';

import type { WebsiteRoute } from './types';

export const CUSTOMER_STORY_ROUTES: readonly WebsiteRoute[] =
  CASE_STUDY_CATALOG_ENTRIES.map((entry) => ({
    id: `customer:${entry.href.slice('/customers/'.length)}`,
    path: entry.href,
    title: `${entry.hero.author} | Twenty Customer Story`,
    description: entry.catalogCard.summary,
    changeFrequency: 'yearly',
    priority: 0.5,
    indexed: true,
  }));
