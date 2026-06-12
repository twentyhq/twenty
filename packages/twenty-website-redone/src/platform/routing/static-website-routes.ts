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
  {
    changeFrequency: 'monthly',
    description: msg`Pipelines, custom objects, AI assistants, and a native API on top of Postgres. Twenty is the open source CRM with the modern UX teams actually want to use.`,
    id: 'product',
    indexed: true,
    path: '/product',
    priority: 0.8,
    title: msg`Twenty CRM Features — Modern Open Source CRM Platform`,
  },
];
