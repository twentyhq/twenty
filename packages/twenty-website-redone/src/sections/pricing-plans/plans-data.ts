import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type PlansHostingMode } from './pricing-state-context';

export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'organization' | 'pro';

export type PlanPrice = {
  prefix: string;
  suffix: MessageDescriptor;
  value: number;
};

type PlansTierCell = {
  featureBullets: MessageDescriptor[];
  price: PlanPrice;
};

type PlansTier = {
  cells: Record<PlansHostingMode, Record<PlansBillingPeriod, PlansTierCell>>;
  heading: MessageDescriptor;
  icon: { alt: string; src: string; widthPx?: number };
};

const PRO_BULLETS_MONTHLY = [
  msg`Full customization`,
  msg`Create custom apps`,
  msg`AI Agents with custom skills`,
  msg`5 workflow credits/month included`,
  msg`Standard support`,
];

const PRO_BULLETS_YEARLY = [
  msg`Full customization`,
  msg`Create custom apps`,
  msg`AI Agents with custom skills`,
  msg`50 workflow credits/year included`,
  msg`Standard support`,
];

const PRO_BULLETS_SELF_HOST = [
  msg`Full customization`,
  msg`Create custom apps`,
  msg`Up to 5 workspaces`,
  msg`Community support`,
];

const ORGANIZATION_BULLETS_CLOUD = [
  msg`Everything in Pro`,
  msg`Row-level permissions`,
  msg`SAML/OIDC SSO`,
  msg`Custom domain`,
  msg`Priority support`,
];

const ORGANIZATION_BULLETS_SELF_HOST = [
  msg`Everything in Pro`,
  msg`Custom AI models`,
  msg`Row-level permissions`,
  msg`SAML/OIDC SSO`,
  msg`Twenty team support`,
];

export const PLANS_DATA: Record<PlansTierId, PlansTier> = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_CLOUD,
          price: { value: 25, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_CLOUD,
          price: { value: 19, prefix: '$', suffix: msg`/user/month` },
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
    heading: msg`Organization`,
    icon: {
      alt: 'Organization plan icon',
      src: '/images/pricing/plans/organization-icon.webp',
    },
  },
  pro: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: PRO_BULLETS_MONTHLY,
          price: { value: 12, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: PRO_BULLETS_YEARLY,
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
    heading: msg`Pro`,
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro-icon.webp',
      widthPx: 60,
    },
  },
};
