import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { SITE_URLS } from '@/platform/site-urls';
import { type PlansHostingMode } from '@/pricing-state';

export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'enterprise' | 'organization' | 'pro';

export type PlanPrice = {
  prefix: string;
  suffix: MessageDescriptor;
  value: number;
  valueSuffix?: string;
};

type PlansTierCell = {
  featureBullets: MessageDescriptor[];
  price: PlanPrice;
};

// A CTA without href opens the contact modal instead of navigating.
type PlansTierCta = {
  href?: string;
  label: MessageDescriptor;
};

type PlansTier = {
  cells: Record<PlansHostingMode, Record<PlansBillingPeriod, PlansTierCell>>;
  cta: Record<PlansHostingMode, PlansTierCta>;
  heading: Record<PlansHostingMode, MessageDescriptor>;
  icon: { alt: string; src: string; widthPx?: number };
  tagline: Record<PlansHostingMode, MessageDescriptor>;
};

const PRO_BULLETS_CLOUD = [
  msg`Your sales process, your data model`,
  msg`Limited personal AI usage`,
  msg`Agentic workflows`,
  msg`Email and calendar sync`,
  msg`Build custom apps`,
];

const PRO_BULLETS_SELF_HOST = [
  msg`Full customization`,
  msg`Create custom apps`,
  msg`Up to 5 workspaces`,
  msg`Community support`,
];

const ORGANIZATION_BULLETS_CLOUD = [
  msg`Everything in Pro`,
  msg`*5x more personal AI usage*`,
  msg`Custom permissions`,
  msg`Priority support`,
  msg`SAML/OIDC SSO and audit logs`,
];

const ORGANIZATION_BULLETS_SELF_HOST = [
  msg`Everything in Pro`,
  msg`Custom AI models`,
  msg`Row-level permissions`,
  msg`SAML/OIDC SSO`,
  msg`Twenty team support`,
];

const ENTERPRISE_BULLETS_CLOUD = [
  msg`Everything in Organization`,
  msg`Dedicated compute for your CRM data and syncs`,
  msg`Single-tenant isolation`,
  msg`Dedicated support & SLA`,
];

const ENTERPRISE_BULLETS_SELF_HOST = [
  msg`Everything in Organization`,
  msg`SCIM provisioning`,
  msg`Air-gapped deployment`,
  msg`LTS releases`,
  msg`Dedicated support & SLA`,
];

const ENTERPRISE_PRICE = {
  value: 50,
  valueSuffix: 'k',
  prefix: 'from $',
  suffix: msg`/year`,
};

export const PLANS_DATA: Record<PlansTierId, PlansTier> = {
  enterprise: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ENTERPRISE_BULLETS_CLOUD,
          price: ENTERPRISE_PRICE,
        },
        yearly: {
          featureBullets: ENTERPRISE_BULLETS_CLOUD,
          price: ENTERPRISE_PRICE,
        },
      },
      selfHost: {
        monthly: {
          featureBullets: ENTERPRISE_BULLETS_SELF_HOST,
          price: ENTERPRISE_PRICE,
        },
        yearly: {
          featureBullets: ENTERPRISE_BULLETS_SELF_HOST,
          price: ENTERPRISE_PRICE,
        },
      },
    },
    cta: {
      cloud: { label: msg`Talk to sales` },
      selfHost: { label: msg`Talk to sales` },
    },
    heading: { cloud: msg`Enterprise`, selfHost: msg`Enterprise` },
    icon: {
      alt: 'Enterprise plan icon',
      src: '/images/pricing/plans/enterprise-icon.webp',
    },
    tagline: {
      cloud: msg`For large companies with custom usage needs.`,
      selfHost: msg`For organizations with strict compliance needs.`,
    },
  },
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_CLOUD,
          price: { value: 52, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_CLOUD,
          price: { value: 39, prefix: '$', suffix: msg`/user/month` },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: { value: 25, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: { value: 19, prefix: '$', suffix: msg`/user/month` },
        },
      },
    },
    cta: {
      cloud: {
        href: SITE_URLS.appWelcome,
        label: msg`Start for free`,
      },
      selfHost: {
        href: SITE_URLS.docsSelfHostLicense,
        label: msg`Start for free`,
      },
    },
    heading: { cloud: msg`Organization`, selfHost: msg`Organization` },
    icon: {
      alt: 'Organization plan icon',
      src: '/images/pricing/plans/organization-icon.webp',
    },
    tagline: {
      cloud: msg`For growing teams that need more AI and control.`,
      selfHost: msg`For companies running Twenty in production.`,
    },
  },
  pro: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: PRO_BULLETS_CLOUD,
          price: { value: 12, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: PRO_BULLETS_CLOUD,
          price: { value: 9, prefix: '$', suffix: msg`/user/month` },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
          price: { value: 0, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
          price: { value: 0, prefix: '$', suffix: msg`/user/month` },
        },
      },
    },
    cta: {
      cloud: {
        href: SITE_URLS.appWelcome,
        label: msg`Start for free`,
      },
      selfHost: {
        href: SITE_URLS.docsSelfHost,
        label: msg`Start for free`,
      },
    },
    heading: { cloud: msg`Pro`, selfHost: msg`Pro` },
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro-icon.webp',
      widthPx: 60,
    },
    tagline: {
      cloud: msg`For one team to run an agentic CRM its own way.`,
      selfHost: msg`For developers to run Twenty on their own servers.`,
    },
  },
};
