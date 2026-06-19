import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Which animated product scene mounts in the card frame when the mockup
// wave (with AppPreview) lands; until then the gradient backdrop — the
// scene's own bottom layer — fills the frame.
export type FeatureIllustrationId =
  | 'familiar-interface'
  | 'live-data'
  | 'fast-path';

export type FeatureCardRecord = {
  backgroundImageSrc: string;
  body: MessageDescriptor;
  heading: MessageDescriptor;
  icon: 'users-group' | 'live-data' | 'fast-path';
  illustration: FeatureIllustrationId;
};

export const FEATURE_CARDS: readonly FeatureCardRecord[] = [
  {
    heading: msg`Familiar, modern interface`,
    body: msg`Twenty makes it simple. It's clean, intuitive, and built to feel like Notion.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/familiar-interface-gradient.webp',
    icon: 'users-group',
    illustration: 'familiar-interface',
  },
  {
    heading: msg`Live data and AI built`,
    body: msg`Everything updates in real time, with AI chat always ready to help you move faster.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/live-data-gradient.webp',
    icon: 'live-data',
    illustration: 'live-data',
  },
  {
    heading: msg`Fast path to action`,
    body: msg`Smart patterns, shortcuts, and layouts make everyday tasks faster and easier to execute.`,
    backgroundImageSrc:
      '/images/home/three-cards-feature/fast-path-gradient.webp',
    icon: 'fast-path',
    illustration: 'fast-path',
  },
];
