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
  { text: 'Community support' },
];

const PRO_BULLETS_SELF_HOST_YEARLY = [
  { text: 'Full customisation' },
  { text: 'Community support' },
];

const ORGANIZATION_BULLETS_DEFAULT = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: '2K automation credits' },
  { text: 'Priority support' },
];

const ORGANIZATION_BULLETS_SELF_HOST = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: 'Priority support' },
];

import type { PlansDataType } from '@/sections/Plans/types';

export const PLANS_DATA = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_DEFAULT,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$25' },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_DEFAULT,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$19' },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$25' },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$19' },
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
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$12' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_DEFAULT,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$9' },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: PRO_BULLETS_SELF_HOST_MONTHLY,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$0' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_SELF_HOST_YEARLY,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$0' },
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
