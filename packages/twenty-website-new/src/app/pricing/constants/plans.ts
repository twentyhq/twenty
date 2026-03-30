const PRO_HEADING = { fontFamily: 'sans' as const, text: 'Pro' };
const ORGANIZATION_HEADING = {
  fontFamily: 'sans' as const,
  text: 'Organization',
};

const PRO_ILLUSTRATION = {
  src: 'https://app.endlesstools.io/embed/207b0732-c6ef-414e-add5-462e68689a2e',
  title: 'Endless Tools Editor',
};

const ORGANIZATION_ILLUSTRATION = {
  src: 'https://app.endlesstools.io/embed/588638be-e22e-4467-b701-3f36e900613d',
  title: 'Endless Tools Editor',
};

const PRO_FEATURES_TITLE = { text: 'Key Features' };
const ORGANIZATION_FEATURES_TITLE = { text: 'everything in pro +' };

const PRO_BULLETS_DEFAULT = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: '1K automation credits' },
  { text: 'Standard support' },
  { text: 'Add-on AI (1-month trial)' },
];

const PRO_BULLETS_SELF_HOST_MONTHLY = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: 'Standard support' },
  { text: 'Add-on AI (1-month trial)' },
];

const PRO_BULLETS_SELF_HOST_YEARLY = [
  { text: 'Full customisation' },
  { text: 'AI Agents with custom skills' },
  { text: 'Standard support' },
  { text: 'Add-on AI (1-month trial)' },
];

const ORGANIZATION_BULLETS = [
  { text: 'Roles & Permissions' },
  { text: 'SAML/OIDC SSO' },
  { text: '2K automation credits' },
  { text: 'Priority support' },
  { text: 'Add-on AI full time' },
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
    featuresTitle: ORGANIZATION_FEATURES_TITLE,
    heading: ORGANIZATION_HEADING,
    illustration: ORGANIZATION_ILLUSTRATION,
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
    featuresTitle: PRO_FEATURES_TITLE,
    heading: PRO_HEADING,
    illustration: PRO_ILLUSTRATION,
  },
} satisfies PlansDataType;
