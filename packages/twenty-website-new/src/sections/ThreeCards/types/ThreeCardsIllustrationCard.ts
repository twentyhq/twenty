import { BodyType } from '@/design-system/components/Body/types/Body';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { ThreeCardsIllustrationCardAttributionType } from './ThreeCardsIllustrationCardAttribution';

export type ThreeCardsIllustrationCardType = {
  heading: HeadingType;
  body: BodyType;
  benefits?: BodyType[];
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: IllustrationType;
};
