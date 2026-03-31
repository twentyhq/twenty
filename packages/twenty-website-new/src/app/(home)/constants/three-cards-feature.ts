import { ThreeCardsFeatureCardsDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_FEATURE_DATA: ThreeCardsFeatureCardsDataType = {
  eyebrow: {
    heading: {
      text: 'Skip the clunky UX that always comes with custom.',
      fontFamily: 'sans',
    },
  },
  heading: [
    { text: 'Make your GTM team happy with ', fontFamily: 'serif' },
    { text: "a CRM they'll love", fontFamily: 'sans' },
  ],
  featureCards: [
    {
      heading: { text: 'Familiar, modern interface', fontFamily: 'sans' },
      body: {
        text: "Twenty makes it simple. It's clean, intuitive, and built to feel like Notion.",
      },
      image: {
        src: '/images/home/three-cards-feature/familiar-interface.png',
        alt: 'Familiar interface',
      },
    },
    {
      heading: { text: 'Fast path to action', fontFamily: 'sans' },
      body: {
        text: 'Smart patterns, shortcuts, and layouts make everyday tasks faster and easier to execute.',
      },
      image: {
        src: '/images/home/three-cards-feature/fast-path.png',
        alt: 'Fast path',
      },
    },
    {
      heading: { text: 'Live data and AI Built', fontFamily: 'sans' },
      body: {
        text: 'Everything updates in real time, with AI chat always ready to help you move faster.',
      },
      image: {
        src: '/images/home/three-cards-feature/live-data.png',
        alt: 'Live data',
      },
    },
  ],
};
