import { msg } from '@lingui/core/macro';
import type { PlansDataType } from '@/sections/Plans/types';

const PRO_HEADING = msg`Pro`;
const ORGANIZATION_HEADING = msg`Organization`;

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

const ORGANIZATION_BULLETS_MONTHLY = [
  msg`Everything in Pro`,
  msg`Row-level permissions`,
  msg`SAML/OIDC SSO`,
  msg`Custom domain`,
  msg`Priority support`,
];

const ORGANIZATION_BULLETS_YEARLY = [
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

export const PLANS_DATA = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_MONTHLY,
          price: { value: 25, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_YEARLY,
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
    heading: ORGANIZATION_HEADING,
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
    heading: PRO_HEADING,
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro-icon.webp',
      width: 60,
    },
  },
} satisfies PlansDataType;
