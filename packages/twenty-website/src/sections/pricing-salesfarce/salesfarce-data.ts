import { msg } from '@lingui/core/macro';

import { type SalesfarceDataType } from './salesfarce-types';

const SALESFARCE_POPUP_TITLE = msg`Good choice!`;

export const SALESFARCE_DATA: SalesfarceDataType = {
  body: msg`Some call this enterprise pricing. We prefer a CRM where API access, webhooks, and workflows don't show up as surprise add-ons.`,
  pricing: {
    addons: [
      {
        cost: 35,
        id: 'api-access',
        label: msg`API access`,
        popup: {
          body: msg`APIs are extra. Simplicity has a price.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$35/user per month`,
      },
      {
        cost: 0,
        fixedCost: 7000,
        id: 'webhooks',
        label: msg`Webhooks (Change Data Capture)`,
        popup: {
          body: msg`Real-time changes? That will be a premium surprise.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$7000/org per month`,
      },
      {
        cost: 0,
        disabled: true,
        id: 'live-updates',
        label: msg`Live updates`,
        popup: {
          body: msg`Live updates are unavailable, which is almost more honest.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Unavailable`,
        tooltip: {
          body: msg`Real-time is a state of mind, not a feature.`,
          title: msg`Unavailable`,
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'ui-theme',
        label: msg`UI theme`,
        popup: {
          body: msg`A retro theme as a paid add-on is somehow the most believable part.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Retro 2015`,
        tooltip: {
          body: msg`Better than Liquid Glass!`,
          title: msg`Included!`,
        },
      },
      {
        cost: 5,
        id: 'sso',
        label: msg`SSO`,
        popup: {
          body: msg`Only $5 for SSO. Practically a charity program.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$5/user per month`,
      },
      {
        cost: 75,
        id: 'permissions',
        label: msg`11 permissions\ngroups`,
        popup: {
          body: msg`Experience enterprise-grade granularity, starting with an 11th permission.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$75/user per month\nSwitch to enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 105,
        id: 'maps',
        label: msg`Maps view`,
        popup: {
          body: msg`Visualize your customers on a map!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$105/user per month`,
      },
      {
        cost: 75,
        id: 'workflows',
        label: msg`6 workflows`,
        popup: {
          body: msg`Start automating at huge scale!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$75/user per month\nSwitch to enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        id: 'lock-in',
        label: msg`Lock-in`,
        popup: {
          body: msg`They call it customer loyalty. We call it a very affectionate cage.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`3 2 years contract\n-33% off`,
        rightLabelParts: [
          [{ strike: true, text: msg`3` }, { text: msg`2 years contract` }],
          [{ text: msg`-33% off` }],
        ],
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'apex-tutorials',
        label: msg`APEX tutorials`,
        popup: {
          body: msg`Even the training material is a feature worth celebrating.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Free for you!`,
        tooltip: {
          body: msg`Available on YouTube!`,
          title: msg`Included!`,
        },
      },
      {
        cost: 0,
        disabled: true,
        id: 'self-hosting',
        label: msg`Self-hosting`,
        popup: {
          body: msg`Owning your stack remains mysteriously out of stock.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Out of stock`,
        tooltip: {
          body: msg`Self-hosting, now for rent!`,
          title: msg`Out of stock`,
        },
      },
      {
        cost: 0,
        defaultChecked: true,
        disabled: true,
        id: 'salesfarce-classic',
        label: msg`Salesforce Classic`,
        popup: {
          body: msg`Classic never dies. It just gets extended one more time.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Extended run!`,
        tooltip: {
          body: msg`Outlived every redesign since 2004.`,
          title: msg`Included!`,
        },
      },
      {
        cost: 75,
        id: 'flow-orchestration',
        label: msg`Flow\norchestration`,
        popup: {
          body: msg`Because true orchestration means putting a dollar sign on every dramatic entrance.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`$1/orchestration run/org\n+$75/user per month\nSwitch to enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 0,
        disabled: true,
        id: 'infinite-scroll',
        label: msg`Infinite scroll`,
        popup: {
          body: msg`Infinite scroll is still coming soon, unlike the invoice.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`Coming soon!`,
        tooltip: {
          body: msg`Pagination builds character.`,
          title: msg`Coming soon!`,
        },
      },
      {
        cost: 75,
        id: 'ai-einstein',
        label: msg`AI (Einstein)`,
        popup: {
          body: msg`become a genius!`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+$75/user per month\nSwitch to enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
      {
        cost: 75,
        id: 'encrypt-data',
        label: msg`Encrypt your data`,
        netSpendRate: 0.2,
        popup: {
          body: msg`Because apparently privacy feels more premium with a surcharge.`,
          titleBar: SALESFARCE_POPUP_TITLE,
        },
        rightLabel: msg`+20% of net spend\n+$75/user per month\nSwitch to enterprise!`,
        sharedCostKey: 'enterprise-plan',
      },
    ],
    basePriceAmount: 100,
    featureSectionHeading: msg`Add-ons`,
    priceSuffix: msg`/ seat / month - billed yearly`,
    productIconAlt: 'Retro help document icon',
    productIconSrc: '/images/pricing/salesfarce/help-icon.webp',
    productTitle: msg`Salesfarce Pro`,
    promoTag: msg`1‑800‑YES‑SOFTWARE`,
    secondaryCtaHref:
      'https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/pricing/all-add-ons.pdf',
    secondaryCtaLabel: msg`Check more add-ons`,
    secondaryCtaNote: msg`More options available!`,
    totalPriceLabel: msg`total per month with fixed cost`,
    windowTitle: msg`Salesfarce Add-on Center`,
  },
};
