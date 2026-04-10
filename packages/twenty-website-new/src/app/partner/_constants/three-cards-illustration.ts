import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: {
      text: 'Which partner program is right for you?',
      fontFamily: 'sans',
    },
  },
  heading: [
    { text: 'Find the program that fits your business ', fontFamily: 'serif' },
    { text: 'and unlock new opportunities with Twenty', fontFamily: 'sans' },
  ],
  body: { text: '' },
  illustrationCards: [
    {
      heading: { text: 'Technology Partners', fontFamily: 'sans' },
      body: {
        text: 'Build integrations that connect Twenty with the tools your customers already use. Help us expand the Twenty ecosystem.',
      },
      benefits: [
        { text: 'Co-marketing opportunities' },
        { text: 'Listing on Twenty integrations page' },
        { text: 'Soon: earn revenue' },
      ],
      attribution: undefined,
      illustration: 'programming',
    },
    {
      heading: { text: 'Content & Community Partners', fontFamily: 'sans' },
      body: {
        text: "Share Twenty with your audience and help shape the future of open-source CRM. We're looking for creators, educators, and community builders who want to showcase great software.",
      },
      benefits: [
        { text: 'Revenue share for referred customers' },
        { text: 'Exclusive content collaboration opportunities' },
        { text: 'Marketing assets & brand resources' },
      ],
      attribution: undefined,
      illustration: 'connect',
    },
    {
      heading: { text: 'Solutions Partners', fontFamily: 'sans' },
      body: {
        text: 'Help customers implement, customize, and succeed with Twenty. Combine sales and services to grow your business.',
      },
      benefits: [
        { text: 'Resale discounts & revenue share' },
        { text: 'Marketplace listing' },
        { text: 'Dedicated partner support' },
      ],
      attribution: undefined,
      illustration: 'grow',
    },
  ],
};
