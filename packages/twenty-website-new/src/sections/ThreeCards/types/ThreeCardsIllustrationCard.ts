import { BodyType } from '@/design-system/components/Body/types/Body';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { ThreeCardsIllustrationCardAttributionType } from './ThreeCardsIllustrationCardAttribution';

export type ThreeCardsIllustrationCardType = {
  heading: HeadingType;
  body: BodyType;
  benefits?: BodyType[];
  attribution?: ThreeCardsIllustrationCardAttributionType;
};
