import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { ImageType } from '@/design-system/components/Image/types/Image';
import { HeroBaseDataType } from '@/sections/Hero/types/HeroBaseData';

export type HeroWhyTwentyDataType = HeroBaseDataType & {
  image: ImageType;
  illustration: IllustrationType;
};
