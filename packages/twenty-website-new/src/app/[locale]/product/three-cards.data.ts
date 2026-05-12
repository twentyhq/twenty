import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards';

export const ILLUSTRATION_CARDS: ThreeCardsIllustrationCardType[] = [
  {
    heading: msg`Built for speed`,
    body: msg`Fly through your workspace with shortcuts and short load times.`,
    benefits: undefined,
    attribution: undefined,
    illustration: 'speed',
  },
  {
    heading: msg`Real-time data`,
    body: msg`See updates as they happen. Work with your team and agents seamlessly.`,
    benefits: undefined,
    attribution: undefined,
    illustration: 'eye',
  },
  {
    heading: msg`Stay in Flow`,
    body: msg`AI chat, settings, and records in a side panels for fast, single-screen access.`,
    benefits: undefined,
    attribution: undefined,
    illustration: 'singleScreen',
  },
];
