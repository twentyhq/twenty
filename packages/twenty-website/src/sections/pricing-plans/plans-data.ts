import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconClock,
  IconCloudOff,
  IconCpu,
  IconFileCertificate,
  IconGauge,
  IconHeadset,
  IconHeartHandshake,
  IconHierarchy,
  IconKey,
  IconLock,
  IconMessages,
  IconServer,
  IconSettingsAutomation,
  IconShieldCog,
  IconSparkles,
  IconStack2,
  IconUsers,
  IconVersions,
} from '@tabler/icons-react';
import { doNotTranslate } from 'twenty-shared/i18n';

import { type IconComponent } from '@/icons';
import { SITE_URLS } from '@/platform/site-urls';
import { type PlansHostingMode } from '@/pricing-state';

export type PlansBillingPeriod = 'monthly' | 'yearly';
export type PlansTierId = 'enterprise' | 'organization' | 'pro';

export type PlanPrice = {
  prefix: string;
  qualifier?: MessageDescriptor;
  suffix: MessageDescriptor;
  value: number;
  valueSuffix?: string;
};

export type PlanFeatureLogo = {
  alt: string;
  shape: 'circle' | 'square';
  src: string;
};

export type PlanFeatureLogos =
  | [PlanFeatureLogo]
  | [PlanFeatureLogo, PlanFeatureLogo]
  | [PlanFeatureLogo, PlanFeatureLogo, PlanFeatureLogo];

export type PlanFeatureVisual =
  | { icon: IconComponent; kind: 'icon' }
  | { kind: 'logos'; logos: PlanFeatureLogos };

export type PlanFeature = {
  description: MessageDescriptor;
  title: MessageDescriptor;
  visual: PlanFeatureVisual;
};

type PlansTierCell = {
  features: PlanFeature[];
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
  featuresIntro: MessageDescriptor;
  heading: Record<PlansHostingMode, MessageDescriptor>;
  icon: { alt: string; src: string; widthPx?: number };
  tagline: Record<PlansHostingMode, MessageDescriptor>;
};

const PLAN_LOGOS = {
  callRecorder: {
    alt: doNotTranslate('Call Recorder'),
    shape: 'square',
    src: '/images/pricing/plans/apps/call-recorder.svg',
  },
  google: {
    alt: doNotTranslate('Google'),
    shape: 'circle',
    src: '/images/shared/companies/logos/google.webp',
  },
  microsoft: {
    alt: doNotTranslate('Microsoft'),
    shape: 'square',
    src: '/images/shared/companies/logos/microsoft.svg',
  },
  peopleDataLabs: {
    alt: doNotTranslate('People Data Labs'),
    shape: 'square',
    src: '/images/pricing/plans/apps/people-data-labs.webp',
  },
  slack: {
    alt: doNotTranslate('Slack'),
    shape: 'square',
    src: '/images/shared/companies/logos/slack.webp',
  },
} satisfies Record<string, PlanFeatureLogo>;

const PRO_FEATURES_CLOUD: PlanFeature[] = [
  {
    title: msg`Emails and meetings log themselves`,
    description: msg`Google and Microsoft email and calendar sync`,
    visual: {
      kind: 'logos',
      logos: [PLAN_LOGOS.google, PLAN_LOGOS.microsoft],
    },
  },
  {
    title: msg`Calls recorded, leads enriched`,
    description: msg`And more apps from our marketplace`,
    visual: {
      kind: 'logos',
      logos: [
        PLAN_LOGOS.callRecorder,
        PLAN_LOGOS.peopleDataLabs,
        PLAN_LOGOS.slack,
      ],
    },
  },
  {
    title: msg`Shaped around how you sell`,
    description: msg`Custom data model, apps and automations`,
    visual: { kind: 'icon', icon: IconHierarchy },
  },
  {
    title: msg`Automate the busywork`,
    description: msg`Agentic workflows`,
    visual: { kind: 'icon', icon: IconSettingsAutomation },
  },
  {
    title: msg`Delegate the CRM chores to AI`,
    description: msg`Limited personal AI usage`,
    visual: { kind: 'icon', icon: IconSparkles },
  },
];

const PRO_FEATURES_SELF_HOST: PlanFeature[] = [
  {
    title: msg`Shaped around how you sell`,
    description: msg`Full customization and custom apps`,
    visual: { kind: 'icon', icon: IconHierarchy },
  },
  {
    title: msg`Room for several teams`,
    description: msg`Up to 5 workspaces`,
    visual: { kind: 'icon', icon: IconStack2 },
  },
  {
    title: msg`Help from the community`,
    description: msg`Community support`,
    visual: { kind: 'icon', icon: IconMessages },
  },
];

const ORGANIZATION_FEATURES_CLOUD: PlanFeature[] = [
  {
    title: msg`Control who does what`,
    description: msg`Custom roles, permissions and usage limits`,
    visual: { kind: 'icon', icon: IconLock },
  },
  {
    title: msg`Ready for your security review`,
    description: msg`SAML/OIDC SSO and audit logs`,
    visual: { kind: 'icon', icon: IconKey },
  },
  {
    title: msg`Faster answers from our team`,
    description: msg`Priority support`,
    visual: { kind: 'icon', icon: IconHeadset },
  },
  {
    title: msg`Find experts to roll it out`,
    description: msg`Access to our implementation partner network`,
    visual: { kind: 'icon', icon: IconHeartHandshake },
  },
  {
    title: msg`Delegate 5x more to AI`,
    description: msg`5x more personal AI usage`,
    visual: { kind: 'icon', icon: IconSparkles },
  },
];

const ORGANIZATION_FEATURES_SELF_HOST: PlanFeature[] = [
  {
    title: msg`Bring your own AI models`,
    description: msg`Custom AI models`,
    visual: { kind: 'icon', icon: IconCpu },
  },
  {
    title: msg`Control who can see what`,
    description: msg`Row-level permissions`,
    visual: { kind: 'icon', icon: IconLock },
  },
  {
    title: msg`Ready for your security review`,
    description: msg`SAML/OIDC SSO`,
    visual: { kind: 'icon', icon: IconKey },
  },
  {
    title: msg`Answers from the team that builds it`,
    description: msg`Twenty team support`,
    visual: { kind: 'icon', icon: IconHeadset },
  },
];

const ENTERPRISE_FEATURES_CLOUD: PlanFeature[] = [
  {
    title: msg`Room to grow, at any scale`,
    description: msg`Dedicated compute and custom API rates`,
    visual: { kind: 'icon', icon: IconGauge },
  },
  {
    title: msg`Your data, fully isolated`,
    description: msg`Single-tenant isolation`,
    visual: { kind: 'icon', icon: IconServer },
  },
  {
    title: msg`Response times you can count on`,
    description: msg`Dedicated support & SLA`,
    visual: { kind: 'icon', icon: IconClock },
  },
  {
    title: msg`Security tailored to your IT`,
    description: msg`VPN, your own AI providers and more`,
    visual: { kind: 'icon', icon: IconShieldCog },
  },
  {
    title: msg`Enterprise procurement support`,
    description: msg`Security reviews and custom contracts`,
    visual: { kind: 'icon', icon: IconFileCertificate },
  },
];

const ENTERPRISE_FEATURES_SELF_HOST: PlanFeature[] = [
  {
    title: msg`Access follows your directory`,
    description: msg`SCIM provisioning`,
    visual: { kind: 'icon', icon: IconUsers },
  },
  {
    title: msg`Runs fully offline`,
    description: msg`Air-gapped deployment`,
    visual: { kind: 'icon', icon: IconCloudOff },
  },
  {
    title: msg`Upgrade on your schedule`,
    description: msg`LTS releases`,
    visual: { kind: 'icon', icon: IconVersions },
  },
  {
    title: msg`Response times you can count on`,
    description: msg`Dedicated support & SLA`,
    visual: { kind: 'icon', icon: IconClock },
  },
];

const ENTERPRISE_PRICE: PlanPrice = {
  value: 50,
  valueSuffix: 'k',
  prefix: '$',
  qualifier: msg`from`,
  suffix: msg`/year`,
};

export const PLANS_DATA: Record<PlansTierId, PlansTier> = {
  enterprise: {
    cells: {
      cloud: {
        monthly: {
          features: ENTERPRISE_FEATURES_CLOUD,
          price: ENTERPRISE_PRICE,
        },
        yearly: {
          features: ENTERPRISE_FEATURES_CLOUD,
          price: ENTERPRISE_PRICE,
        },
      },
      selfHost: {
        monthly: {
          features: ENTERPRISE_FEATURES_SELF_HOST,
          price: ENTERPRISE_PRICE,
        },
        yearly: {
          features: ENTERPRISE_FEATURES_SELF_HOST,
          price: ENTERPRISE_PRICE,
        },
      },
    },
    cta: {
      cloud: { label: msg`Talk to sales` },
      selfHost: { label: msg`Talk to sales` },
    },
    featuresIntro: msg`Everything in Organization, plus`,
    heading: { cloud: msg`Enterprise`, selfHost: msg`Enterprise` },
    icon: {
      alt: 'Enterprise plan icon',
      src: '/images/pricing/plans/enterprise.webp',
      widthPx: 55,
    },
    tagline: {
      cloud: msg`Dedicated scale for large companies.`,
      selfHost: msg`For strict compliance, at scale.`,
    },
  },
  organization: {
    cells: {
      cloud: {
        monthly: {
          features: ORGANIZATION_FEATURES_CLOUD,
          price: { value: 52, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          features: ORGANIZATION_FEATURES_CLOUD,
          price: { value: 39, prefix: '$', suffix: msg`/user/month` },
        },
      },
      selfHost: {
        monthly: {
          features: ORGANIZATION_FEATURES_SELF_HOST,
          price: { value: 25, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          features: ORGANIZATION_FEATURES_SELF_HOST,
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
    featuresIntro: msg`Everything in Pro, plus`,
    heading: { cloud: msg`Organization`, selfHost: msg`Organization` },
    icon: {
      alt: 'Organization plan icon',
      src: '/images/pricing/plans/organization.webp',
      widthPx: 75,
    },
    tagline: {
      cloud: msg`More AI and control for several teams.`,
      selfHost: msg`For several teams, in production.`,
    },
  },
  pro: {
    cells: {
      cloud: {
        monthly: {
          features: PRO_FEATURES_CLOUD,
          price: { value: 12, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          features: PRO_FEATURES_CLOUD,
          price: { value: 9, prefix: '$', suffix: msg`/user/month` },
        },
      },
      selfHost: {
        monthly: {
          features: PRO_FEATURES_SELF_HOST,
          price: { value: 0, prefix: '$', suffix: msg`/user/month` },
        },
        yearly: {
          features: PRO_FEATURES_SELF_HOST,
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
    featuresIntro: msg`Includes`,
    heading: { cloud: msg`Pro`, selfHost: msg`Pro` },
    icon: {
      alt: 'Pro plan icon',
      src: '/images/pricing/plans/pro.webp',
      widthPx: 57,
    },
    tagline: {
      cloud: msg`A custom agentic CRM for one team.`,
      selfHost: msg`For one team, on your servers.`,
    },
  },
};
