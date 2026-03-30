import { ImageType } from '@/design-system/components/Image/types/Image';
import { HeroBaseDataType } from '@/sections/Hero/types/HeroBaseData';

export type HeroHomeDataType = HeroBaseDataType & {
  background: ImageType;
  foreground: ImageType;
};
