import { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

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
      illustration: {
        src: 'https://app.endlesstools.io/embed/627cb43a-5b5f-41a7-9642-26e66b9c4890',
        title: 'Endless Tools Editor',
      },
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
      illustration: {
        src: 'https://app.endlesstools.io/embed/4ef11ab1-d013-46dd-bf2e-cbf913370a8a',
        title: 'Endless Tools Editor',
      },
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
      illustration: {
        src: 'https://app.endlesstools.io/embed/624e9b40-f52c-4da2-9a2e-72d1fb2b5356',
        title: 'Endless Tools Editor',
      },
    },
  ],
};
