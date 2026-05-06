import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { ImageType } from '@/design-system/components/Image';
import type { FeatureTileType } from '@/sections/Feature/types/FeatureTile';

export type FeatureDataType = {
  eyebrow: MessageEyebrow;
  mask: ImageType;
  tiles: FeatureTileType[];
};
