const PRO_HEADING = { fontFamily: 'sans' as const, text: 'Pro' };
const ORGANIZATION_HEADING = {
  fontFamily: 'sans' as const,
  text: 'Organization',
};

const PRO_BULLETS_MONTHLY = [
  { text: 'Full customization' },
  { text: 'Create custom apps' },
  { text: 'AI Agents with custom skills' },
  { text: 'Up to 5M automation credits/month' },
  { text: 'Standard support' },
];

const PRO_BULLETS_YEARLY = [
  { text: 'Full customization' },
  { text: 'Create custom apps' },
  { text: 'AI Agents with custom skills' },
  { text: 'Up to 50M automation credits/year' },
  { text: 'Standard support' },
];

const PRO_BULLETS_SELF_HOST = [
  { text: 'Full customization' },
  { text: 'Create custom apps' },
  { text: 'Community support' },
];

const ORGANIZATION_BULLETS_MONTHLY = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: 'Priority support' },
];

const ORGANIZATION_BULLETS_YEARLY = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: 'Priority support' },
];

const ORGANIZATION_BULLETS_SELF_HOST = [
  { text: 'Everything in Pro' },
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: 'Twenty team support' },
  { text: 'No open-source distribution requirement' },
];

import type { PlansDataType } from '@/sections/Plans/types';

export const PLANS_DATA = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_MONTHLY,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$25' },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_YEARLY,
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
          featureBullets: PRO_BULLETS_MONTHLY,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$12' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_YEARLY,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$9' },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
          price: {
            body: { text: '/user/month' },
            heading: { fontFamily: 'sans', text: '$0' },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
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
