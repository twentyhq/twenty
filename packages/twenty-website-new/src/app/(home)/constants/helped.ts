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
      illustration: {
        src: 'https://app.endlesstools.io/embed/54cb2a73-baef-4eff-9957-17d262b5bbaf',
        title: '',
      },
    },
    {
      icon: 'beagle',
      heading: { text: 'Build performing onboarding', fontFamily: 'sans' },
      body: {
        text: 'Beagle launched a custom onboarding pipeline and shortened their sales cycle by 30%.',
      },
      illustration: {
        src: 'https://app.endlesstools.io/embed/0988b17d-7648-4b95-bd6b-8fab1e798da9',
        title: '',
      },
    },

    {
      icon: 'evergreen',
      heading: { text: 'Unify workflow', fontFamily: 'sans' },
      body: {
        text: 'Evergreen unified sales and CS workflows, boosting expansion revenue by 25%.',
      },
      illustration: {
        src: 'https://app.endlesstools.io/embed/18fc3259-eb0d-4254-961c-0fc26aa7b205',
        title: '',
      },
    },
  ],
};
