import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: { text: 'Stop settling for trade-offs.', fontFamily: 'sans' },
  },
  heading: [
    { text: 'A modern CRM with ', fontFamily: 'serif' },
    { text: 'an intuitive interface', fontFamily: 'sans' },
  ],
  body: { text: '' },
  illustrationCards: [
    {
      heading: { text: 'Built for speed', fontFamily: 'sans' },
      body: {
        text: 'Fly through your workspace with shortcuts and short load times.',
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'speed',
    },
    {
      heading: { text: 'Real-time data', fontFamily: 'sans' },
      body: {
        text: 'See updates as they happen. Work with your team and agents seamlessly.',
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'eye',
    },
    {
      heading: { text: 'Stay in Flow', fontFamily: 'sans' },
      body: {
        text: 'AI chat, settings, and records in a side panels for fast, single-screen access.',
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'singleScreen',
    },
  ],
};
