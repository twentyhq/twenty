const PRO_HEADING = { fontFamily: 'sans' as const, text: 'Pro' };
const ORGANIZATION_HEADING = {
  fontFamily: 'sans' as const,
  text: 'Organization',
};

const PRO_BULLETS_DEFAULT = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: '1K automation credits' },
  { text: 'Standard support' },
];

const PRO_BULLETS_SELF_HOST_MONTHLY = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: 'Standard support' },
];

const PRO_BULLETS_SELF_HOST_YEARLY = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: 'Standard support' },
];

const ORGANIZATION_BULLETS = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: '2K automation credits' },
  { text: 'Priority support' },
];

import type { PlansDataType } from '@/sections/Plans/types';

export const PLANS_DATA = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS,
          price: {
            body: { text: '/month, paid monthly' },
            heading: { fontFamily: 'sans', text: '$25 USD' },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS,
          price: {
            body: { text: '/month, paid yearly' },
            heading: { fontFamily: 'sans', text: '$19 USD' },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS,
          price: {
            body: { text: '/month, paid monthly' },
            heading: { fontFamily: 'sans', text: '$25 USD' },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS,
          price: {
            body: { text: '/month, paid yearly' },
            heading: { fontFamily: 'sans', text: '$19 USD' },
          },
        },
      },
    },
    heading: ORGANIZATION_HEADING,
    icon: {
      alt: 'Organization plan icon',
      src: '/images/pricing/plans/organization-icon.png',
    },
  },
  pro: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: PRO_BULLETS_DEFAULT,
          price: {
            body: { text: '/month, paid monthly' },
            heading: { fontFamily: 'sans', text: '$12 USD' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_DEFAULT,
          price: {
            body: { text: '/month, paid yearly' },
            heading: { fontFamily: 'sans', text: '$9 USD' },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: PRO_BULLETS_SELF_HOST_MONTHLY,
          price: {
            body: { text: '/month, paid monthly' },
            heading: { fontFamily: 'sans', text: '$0 USD' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_SELF_HOST_YEARLY,
          price: {
            body: { text: '/month, paid yearly' },
            heading: { fontFamily: 'sans', text: '$0 USD' },
          },
        },
      },
    },
    heading: PRO_HEADING,
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro-icon.png',
      width: 60,
    },
  },
} satisfies PlansDataType;
