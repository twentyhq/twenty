import type { SalesforceDataType } from '@/sections/Salesforce/types';

const SALESFORCE_POPUP_TITLE = 'Good choice!';

export const SALESFORCE_DATA: SalesforceDataType = {
  body: {
    text: "Some call this enterprise pricing. We prefer a CRM where API access, webhooks, and workflows don't show up as surprise add-ons.",
  },
  heading: [
    { text: 'Trust the n°1 CRM,', fontFamily: 'serif' },
    { text: ' or not !', fontFamily: 'sans' },
  ],
  pricing: {
    addons: [
      {
        cost: 35,
        id: 'api-access',
        label: 'API access',
        popup: {
          body: 'APIs are extra. Simplicity has a price.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$35/user per month',
      },
      {
        cost: 0,
        fixedCost: 7000,
        id: 'webhooks',
        label: 'Webhooks (Change Data Capture)',
        popup: {
          body: 'Real-time changes? That will be a premium surprise.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$7000/org per month',
      },
      {
        cost: 0,
        disabled: true,
        id: 'live-updates',
        label: 'Live updates',
        popup: {
          body: 'Live updates are unavailable, which is almost more honest.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Unavailable',
        tooltip: {
          title: 'Unavailable',
          body: 'Real-time is a state of mind, not a feature.',
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'ui-theme',
        label: 'UI theme',
        popup: {
          body: 'A retro theme as a paid add-on is somehow the most believable part.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Retro 2015',
        tooltip: {
          title: 'Included!',
          body: 'Better than Liquid Glass!',
        },
      },
      {
        cost: 5,
        id: 'sso',
        label: 'SSO',
        popup: {
          body: 'Only $5 for SSO. Practically a charity program.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$5/user per month',
      },
      {
        cost: 75,
        id: 'permissions',
        label: '11 permissions\ngroups',
        popup: {
          body: 'Experience enterprise-grade granularity, starting with an 11th permission.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$75/user per month\nSwitch to enterprise!',
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 105,
        id: 'maps',
        label: 'Maps view',
        popup: {
          body: 'Visualize your customers on a map!',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$105/user per month',
      },
      {
        cost: 75,
        id: 'workflows',
        label: '6 workflows',
        popup: {
          body: 'Start automating at huge scale!',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$75/user per month\nSwitch to enterprise!',
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        id: 'lock-in',
        label: 'Lock-in',
        popup: {
          body: 'They call it customer loyalty. We call it a very affectionate cage.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '3 2 years contract\n-33% off',
        rightLabelParts: [
          [{ strike: true, text: '3' }, { text: ' 2 years contract' }],
          [{ text: '-33% off' }],
        ],
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'apex-tutorials',
        label: 'APEX tutorials',
        popup: {
          body: 'Even the training material is a feature worth celebrating.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Free for you!',
        tooltip: {
          title: 'Included!',
          body: 'Available on YouTube!',
        },
      },
      {
        cost: 0,
        disabled: true,
        id: 'self-hosting',
        label: 'Self-hosting',
        popup: {
          body: 'Owning your stack remains mysteriously out of stock.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Out of stock',
        tooltip: {
          title: 'Out of stock',
          body: 'Self-hosting, now for rent!',
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'salesforce-classic',
        label: 'Salesforce Classic',
        popup: {
          body: 'Classic never dies. It just gets extended one more time.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Extended run!',
        tooltip: {
          title: 'Included!',
          body: 'Outlived every redesign since 2004.',
        },
      },
      {
        cost: 75,
        id: 'flow-orchestration',
        label: 'Flow\norchestration',
        popup: {
          body: 'Because true orchestration means putting a dollar sign on every dramatic entrance.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel:
          '$1/orchestration run/org\n+$75/user per month\nSwitch to enterprise!',
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        disabled: true,
        id: 'infinite-scroll',
        label: 'Infinite scroll',
        popup: {
          body: 'Infinite scroll is still coming soon, unlike the invoice.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: 'Coming soon!',
        tooltip: {
          title: 'Coming soon!',
          body: 'Pagination builds character.',
        },
      },
      {
        cost: 75,
        id: 'ai-einstein',
        label: 'AI (Einstein)',
        popup: {
          body: 'become a genius!',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel: '+$75/user per month\nSwitch to enterprise!',
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 75,
        id: 'encrypt-data',
        label: 'Encrypt your data',
        netSpendRate: 0.2,
        popup: {
          body: 'Because apparently privacy feels more premium with a surcharge.',
          titleBar: SALESFORCE_POPUP_TITLE,
        },
        rightLabel:
          '+20% of net spend\n+$75/user per month\nSwitch to enterprise!',
        sharedCostKey: 'enterprise-plan',
      },
    ],
    basePriceAmount: 100,
    promoTag: '1‑800‑YES‑SOFTWARE',
    featureSectionHeading: 'Add-ons',
    productIconAlt: 'Retro help document icon',
    productIconSrc: '/images/pricing/salesforce/help-icon.webp',
    priceSuffix: ' / seat / month - billed yearly',
    productTitle: 'Salesfarce Pro',
    secondaryCtaNote: 'More options available!',
    secondaryCtaHref:
      'https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/pricing/all-add-ons.pdf',
    secondaryCtaLabel: 'Check more add-ons',
    totalPriceLabel: 'total per month with fixed cost',
    windowTitle: 'Salesfarce Add-on Center',
  },
};
