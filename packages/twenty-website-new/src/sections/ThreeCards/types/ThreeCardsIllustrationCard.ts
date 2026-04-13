import { type BodyType } from '@/design-system/components/Body/types/Body';
import { type HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ThreeCardsIllustrationId } from '@/illustrations';
import { type ThreeCardsIllustrationCardAttributionType } from './ThreeCardsIllustrationCardAttribution';

export type ThreeCardsIllustrationCardType = {
  heading: HeadingType;
  body: BodyType;
  benefits?: BodyType[];
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: ThreeCardsIllustrationId;
  caseStudySlug?: string;
};
