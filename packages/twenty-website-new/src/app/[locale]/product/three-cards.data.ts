import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: { text: msg`Stop settling for trade-offs.`, fontFamily: 'sans' },
  },
  illustrationCards: [
    {
      heading: { text: msg`Built for speed`, fontFamily: 'sans' },
      body: {
        text: msg`Fly through your workspace with shortcuts and short load times.`,
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'speed',
    },
    {
      heading: { text: msg`Real-time data`, fontFamily: 'sans' },
      body: {
        text: msg`See updates as they happen. Work with your team and agents seamlessly.`,
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'eye',
    },
    {
      heading: { text: msg`Stay in Flow`, fontFamily: 'sans' },
      body: {
        text: msg`AI chat, settings, and records in a side panels for fast, single-screen access.`,
      },
      benefits: undefined,
      attribution: undefined,
      illustration: 'singleScreen',
    },
  ],
};
