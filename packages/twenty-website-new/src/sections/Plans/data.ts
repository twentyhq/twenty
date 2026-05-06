import { msg } from '@lingui/core/macro';
import type { PlansDataType } from '@/sections/Plans/types';

const PRO_HEADING = { fontFamily: 'sans' as const, text: msg`Pro` };
const ORGANIZATION_HEADING = {
  fontFamily: 'sans' as const,
  text: msg`Organization`,
};

const PRO_BULLETS_MONTHLY = [
  { text: msg`Full customization` },
  { text: msg`Create custom apps` },
  { text: msg`AI Agents with custom skills` },
  { text: msg`Up to 5M automation credits/month` },
  { text: msg`Standard support` },
];

const PRO_BULLETS_YEARLY = [
  { text: msg`Full customization` },
  { text: msg`Create custom apps` },
  { text: msg`AI Agents with custom skills` },
  { text: msg`Up to 50M automation credits/year` },
  { text: msg`Standard support` },
];

const PRO_BULLETS_SELF_HOST = [
  { text: msg`Full customization` },
  { text: msg`Create custom apps` },
  { text: msg`Community support` },
];

const ORGANIZATION_BULLETS_MONTHLY = [
  { text: msg`Everything in Pro` },
  { text: msg`Roles & Permissions` },
  { text: msg`SAML/OIDC SSO` },
  { text: msg`Priority support` },
];

const ORGANIZATION_BULLETS_YEARLY = [
  { text: msg`Everything in Pro` },
  { text: msg`Roles & Permissions` },
  { text: msg`SAML/OIDC SSO` },
  { text: msg`Priority support` },
];

const ORGANIZATION_BULLETS_SELF_HOST = [
  { text: msg`Everything in Pro` },
  { text: msg`Roles & Permissions` },
  { text: msg`SAML/OIDC SSO` },
  { text: msg`Twenty team support` },
  { text: msg`No open-source distribution requirement` },
];

export const PLANS_DATA = {
  organization: {
    cells: {
      cloud: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_MONTHLY,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$25` },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_YEARLY,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$19` },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$25` },
          },
        },
        yearly: {
          featureBullets: ORGANIZATION_BULLETS_SELF_HOST,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$19` },
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
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$12` },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_YEARLY,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$9` },
          },
        },
      },
      selfHost: {
        monthly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$0` },
          },
        },
        yearly: {
          featureBullets: PRO_BULLETS_SELF_HOST,
          price: {
            body: { text: msg`/user/month` },
            heading: { fontFamily: 'sans', text: msg`$0` },
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
