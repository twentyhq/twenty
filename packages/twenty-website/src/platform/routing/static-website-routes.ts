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
  {
    changeFrequency: 'monthly',
    description: msg`Cloud Pro starts at $9/user/month with unlimited custom objects. Self-host the open source core for free, or upgrade to Organization for SSO and row-level permissions.`,
    id: 'pricing',
    indexed: true,
    path: '/pricing',
    priority: 0.9,
    title: msg`Twenty CRM Pricing — Plans from $9 per User per Month`,
  },
  {
    changeFrequency: 'monthly',
    description: msg`Find a certified Twenty partner to migrate, customise, and operate your open source CRM, or join the ecosystem and grow your practice with us.`,
    id: 'partners',
    indexed: true,
    path: '/partners',
    priority: 0.7,
    title: msg`Twenty Partners — Certified Open Source CRM Implementers`,
  },
  {
    changeFrequency: 'weekly',
    description: msg`Browse Twenty's certified partners — the agencies and individuals who migrate, customise, host, and support the open source CRM across regions, languages, and deployment models.`,
    id: 'partnersList',
    indexed: true,
    path: '/partners/list',
    priority: 0.6,
    title: msg`Find a Twenty Partner — Open Source CRM Marketplace`,
  },
  {
    // The application form: noindex (a utility route, excluded from the
    // sitemap by getIndexedWebsiteRoutes), reachable from the partner CTAs.
    changeFrequency: 'yearly',
    description: msg`Apply to join the Twenty partner ecosystem and grow your practice with the #1 open source CRM.`,
    id: 'partnersApply',
    indexed: false,
    path: '/partners/apply',
    priority: 0.3,
    title: msg`Become a Twenty Partner — Apply`,
  },
  {
    changeFrequency: 'monthly',
    description: msg`Packaged CRMs make every company look the same. Twenty is the open source CRM teams shape around their workflow, with a modern UI and a developer-first platform.`,
    id: 'whyTwenty',
    indexed: true,
    path: '/why-twenty',
    priority: 0.8,
    title: msg`Why Twenty — The Open Source CRM Built to Be Customised`,
  },
  {
    changeFrequency: 'weekly',
    description: msg`Every new release of Twenty, the #1 Open Source CRM, with changelogs, demos, and the highlights teams care about most.`,
    id: 'releases',
    indexed: true,
    path: '/releases',
    priority: 0.7,
    title: msg`Twenty Releases — What's New in the Open Source CRM`,
  },
  {
    changeFrequency: 'monthly',
    description: msg`Real customer stories from teams running their business on Twenty: how they migrated, what they customised, and what changed once their CRM finally fit.`,
    id: 'customers',
    indexed: true,
    path: '/customers',
    priority: 0.7,
    title: msg`Twenty Customers — How Modern Teams Run Their CRM`,
  },
  {
    changeFrequency: 'yearly',
    description: msg`How Twenty collects, uses, and protects your data — our GDPR- and CCPA-compliant privacy policy.`,
    id: 'privacyPolicy',
    indexed: true,
    path: '/privacy-policy',
    priority: 0.3,
    title: msg`Privacy Policy | Twenty`,
  },
  {
    changeFrequency: 'yearly',
    description: msg`The terms governing your use of Twenty and its open source CRM services.`,
    id: 'terms',
    indexed: true,
    path: '/terms',
    priority: 0.3,
    title: msg`Terms of Service | Twenty`,
  },
  {
    // Post-checkout license activation: noindex (a utility route reached only
    // with a Stripe ?session_id=, excluded from the sitemap).
    changeFrequency: 'yearly',
    description: msg`Activate your Twenty enterprise license after checkout and copy your key into your self-hosted instance.`,
    id: 'enterpriseActivate',
    indexed: false,
    path: '/enterprise/activate',
    priority: 0.3,
    title: msg`Enterprise Activation | Twenty`,
  },
  {
    // The interactive halftone generator: an internal dev tool, noindex and
    // excluded from the sitemap (getIndexedWebsiteRoutes). Mounted client-only.
    changeFrequency: 'monthly',
    description: msg`Interactive halftone generator exported from Twenty.`,
    id: 'halftone',
    indexed: false,
    path: '/halftone',
    priority: 0,
    title: msg`Halftone Generator | Twenty`,
  },
];
