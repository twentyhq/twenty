import { type MessageDescriptor } from '@lingui/core';

import { type FeatureBulletIcon } from './feature-bullet-icon';

export type FeatureBullet = {
  icon: FeatureBulletIcon;
  text: MessageDescriptor;
};
