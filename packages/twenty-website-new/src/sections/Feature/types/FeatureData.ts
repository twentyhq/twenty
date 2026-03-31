import { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { ImageType } from '@/design-system/components/Image/types/Image';
import { FeatureTileType } from '@/sections/Feature/types/FeatureTile';

export type FeatureDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  mask: ImageType;
  tiles: FeatureTileType[];
};
