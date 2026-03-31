import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ImageType } from '@/design-system/components/Image/types/Image';
import type { FeatureTileType } from '@/sections/Feature/types/FeatureTile';

export type FeatureDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  mask: ImageType;
  tiles: FeatureTileType[];
};
