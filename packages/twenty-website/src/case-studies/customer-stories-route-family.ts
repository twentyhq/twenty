import { DOCUMENTATION_DEFAULT_LANGUAGE } from 'twenty-shared/constants';

import { createI18nInstance } from '@/platform/i18n/create-i18n-instance';
import { type WebsiteRouteFamily } from '@/platform/routing/website-route';

import { CASE_STUDY_CATALOG } from './case-study-catalog';

export const CUSTOMER_STORIES_ROUTE_FAMILY: WebsiteRouteFamily = {
  id: 'customerStories',
  basePath: '/customers',
  changeFrequency: 'monthly',
  priority: 0.6,
  indexed: true,
  enumerateEntries: async () => {
    const i18n = createI18nInstance(DOCUMENTATION_DEFAULT_LANGUAGE);
    return CASE_STUDY_CATALOG.map((entry) => ({
      slug: entry.slug,
      title: i18n._(entry.title),
      description: i18n._(entry.summary),
    }));
  },
};
