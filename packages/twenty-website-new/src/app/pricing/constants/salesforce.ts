import type { SalesforceDataType } from '@/sections/Salesforce/types';

export const SALESFORCE_DATA: SalesforceDataType = {
  body: {
    text: 'Aenean lacinia bibendum nulla sed consectetur. Integer posuere erat a ante venenatis dapibus.',
  },
  heading: [
    { text: 'Trust the n°1 CRM,', fontFamily: 'serif' },
    { text: ' or not!', fontFamily: 'sans' },
  ],
  pricing: {
    addons: [
      {
        id: 'api-access',
        label: 'API access',
        popupKey: 'wrongChoiceDefault',
        rightLabel: '+$35/user per month',
      },
      {
        id: 'webhooks',
        label: 'Webhooks (Change data capture)',
        popupKey: 'wrongChoiceLorem',
        rightLabel: '+$7000/org per month',
      },
      {
        disabled: true,
        id: 'live-updates',
        label: 'Live updates',
        popupKey: 'wrongChoiceDefault',
        rightLabel: 'Unavailable',
      },
      {
        defaultChecked: true,
        id: 'ui-theme',
        label: 'UI theme',
        popupKey: 'wrongChoiceDefault',
        rightLabel: 'Retro 2015',
      },
      {
        id: 'sso',
        label: 'SSO',
        popupKey: 'wrongChoiceDefault',
        rightLabel: '+$5/user per month',
      },
      {
        id: 'permissions',
        label: '11 permissions groups',
        popupKey: 'wrongChoiceDefault',
        rightLabel: '+$75/user per month (Switch to enterprise!)',
      },
      {
        id: 'maps',
        label: 'Maps view',
        popupKey: 'wrongChoiceDefault',
        rightLabel: '+$105/user per month',
      },
    ],
    featureSectionHeading: 'Best for Salesforce',
    priceAmount: '$100 USD',
    priceSuffix: ' / seat / month - billed yearly',
    primaryCtaLabel: 'Do you really want to click and ask your first quote ???',
    productTitle: 'Salesforce Pro',
    secondaryCtaLabel: "More options available, BUT DON'T CLICK !!",
    windowTitle: 'Salesforce Pro pricing',
  },
};
