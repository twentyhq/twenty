import { msg } from '@lingui/core/macro';

import { type WebsiteRoute } from './website-route';

export const STATIC_WEBSITE_ROUTES: readonly WebsiteRoute[] = [
  {
    changeFrequency: 'weekly',
    description: msg`The #1 Open Source CRM for modern teams. Modular, scalable, and built to fit your business.`,
    id: 'home',
    indexed: true,
    path: '/',
    priority: 1,
    title: msg`Twenty | #1 Open Source CRM`,
  },
];
