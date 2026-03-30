import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { HeroBaseDataType } from '@/sections/Hero/types/HeroBaseData';

export type HeroIllustrationDataType = HeroBaseDataType & {
  illustration: IllustrationType;
};
