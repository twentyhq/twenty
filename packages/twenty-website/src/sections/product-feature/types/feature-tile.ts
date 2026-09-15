import { type MessageDescriptor } from '@lingui/core';

import { type FeatureBullet } from './feature-bullet';
import { type FeatureVisualKey } from './feature-visual-key';

export type FeatureTile = {
  bullets: FeatureBullet[];
  category: MessageDescriptor;
  description: MessageDescriptor;
  heading: MessageDescriptor;
  visual: FeatureVisualKey;
};
