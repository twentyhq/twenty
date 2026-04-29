import type { WebsiteRoute } from './types';

export const STATIC_WEBSITE_ROUTES = [
  {
    id: 'home',
    path: '/',
    title: 'Twenty | #1 open source CRM',
    description:
      'The #1 open source CRM for modern teams. Modular, scalable, and built to fit your business.',
    changeFrequency: 'weekly',
    priority: 1,
    indexed: true,
  },
  {
    id: 'whyTwenty',
    path: '/why-twenty',
    title: 'Why Twenty | Twenty',
    description:
      'Most packaged software makes companies more similar. Learn why the future of CRM is built, not bought.',
    changeFrequency: 'monthly',
    priority: 0.8,
    indexed: true,
  },
  {
    id: 'product',
    path: '/product',
    title: 'Product | Twenty',
    description:
      'Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.',
    changeFrequency: 'monthly',
    priority: 0.8,
    indexed: true,
  },
  {
    id: 'pricing',
    path: '/pricing',
    title: 'Pricing | Twenty',
    description:
      'Plans that scale with your team. Compare tiers of the #1 open source CRM.',
    changeFrequency: 'monthly',
    priority: 0.9,
    indexed: true,
  },
  {
    id: 'partners',
    path: '/partners',
    title: 'Partners | Twenty',
    description:
      'Join our partner ecosystem and grow with us as we build the #1 open source CRM.',
    changeFrequency: 'monthly',
    priority: 0.7,
    indexed: true,
  },
  {
    id: 'releases',
    path: '/releases',
    title: 'Releases | Twenty',
    description:
      'Discover the newest features and improvements in Twenty, the #1 open source CRM.',
    changeFrequency: 'weekly',
    priority: 0.7,
    indexed: true,
  },
  {
    id: 'customers',
    path: '/customers',
    title: 'Customers | Twenty',
    description:
      'Meet the teams running their business on Twenty. Real customer stories on how they shaped the CRM to fit their workflow.',
    changeFrequency: 'monthly',
    priority: 0.7,
    indexed: true,
  },
  {
    id: 'privacyPolicy',
    path: '/privacy-policy',
    title: 'Privacy Policy | Twenty',
    description:
      'How Twenty collects, uses, safeguards, and discloses information when you use Twenty.com and related services.',
    changeFrequency: 'yearly',
    priority: 0.3,
    indexed: true,
  },
  {
    id: 'terms',
    path: '/terms',
    title: 'Terms of Service | Twenty',
    description:
      'Terms of Service for Twenty.com PBC, including use of Twenty.com, sub-domains, and related services.',
    changeFrequency: 'yearly',
    priority: 0.3,
    indexed: true,
  },
  {
    id: 'halftone',
    path: '/halftone',
    title: 'Halftone Generator | Twenty',
    description: 'Interactive halftone generator exported from Twenty.',
    changeFrequency: 'monthly',
    priority: 0,
    indexed: false,
    robotsDisallow: true,
  },
  {
    id: 'enterpriseActivate',
    path: '/enterprise/activate',
    title: 'Enterprise activation | Twenty',
    description:
      'Complete activation for your Twenty self-hosted enterprise license.',
    changeFrequency: 'yearly',
    priority: 0,
    indexed: false,
    robotsDisallow: true,
  },
] as const satisfies readonly WebsiteRoute[];
