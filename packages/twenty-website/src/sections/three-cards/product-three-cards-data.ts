import { msg } from '@lingui/core/macro';

import { type IllustrationCardRecord } from './three-cards.data';

export const PRODUCT_ILLUSTRATION_CARDS: readonly IllustrationCardRecord[] = [
  {
    heading: msg`Built for speed`,
    body: msg`Fly through your workspace with shortcuts and short load times.`,
    illustration: 'speed',
  },
  {
    heading: msg`Real-time data`,
    body: msg`See updates as they happen. Work with your team and agents seamlessly.`,
    illustration: 'eye',
  },
  {
    heading: msg`Stay in Flow`,
    body: msg`AI chat, settings, and records in a side panels for fast, single-screen access.`,
    illustration: 'singleScreen',
  },
];
