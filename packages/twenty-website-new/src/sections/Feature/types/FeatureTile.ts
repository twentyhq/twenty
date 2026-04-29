import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';
import type { ImageType } from '@/design-system/components/Image';

export type FeatureTileType = {
  bullets: BodyType[];
  heading: HeadingType;
  icon: string;
  image: ImageType;
};
