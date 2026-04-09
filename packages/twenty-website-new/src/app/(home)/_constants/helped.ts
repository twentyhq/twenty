import type { HelpedDataType } from '@/sections/Helped/types/HelpedData';

export const HELPED_DATA: HelpedDataType = {
  eyebrow: {
    heading: {
      text: 'Twenty helped them',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'Make your GTM team happy with a',
      fontFamily: 'serif',
    },
    {
      text: " CRM they'll love",
      fontFamily: 'sans',
    },
  ],
  cards: [
    {
      icon: 'realytics',
      heading: { text: 'Increase lead qualification', fontFamily: 'sans' },
      body: {
        text: 'Realytics built lead scoring into their CRM and increased qualified outbound by 40%.',
      },
      illustration: 'target',
    },
    {
      icon: 'beagle',
      heading: { text: 'Build performing onboarding', fontFamily: 'sans' },
      body: {
        text: 'Beagle launched a custom onboarding pipeline and shortened their sales cycle by 30%.',
      },
      illustration: 'spaceship',
    },

    {
      icon: 'evergreen',
      heading: { text: 'Unify workflow', fontFamily: 'sans' },
      body: {
        text: 'Evergreen unified sales and CS workflows, boosting expansion revenue by 25%.',
      },
      illustration: 'money',
    },
  ],
};
