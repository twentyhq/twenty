import { BodyType } from '@/design-system/components/Body/types/Body';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { ImageType } from '@/design-system/components/Image/types/Image';

export type FeatureTileType = {
  image: ImageType;
  icon: string;
  heading: HeadingType;
  bullets: BodyType[];
};
