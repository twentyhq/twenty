import { type BodyType } from '@/design-system/components/Body/types/Body';
import { type HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ThreeCardsIllustrationId } from '@/illustrations';
import { type ThreeCardsIllustrationCardAttributionType } from './ThreeCardsIllustrationCardAttribution';

export type ThreeCardsIllustrationCardActionType = {
  kind: 'partnerApplication';
  label: string;
  programId: 'technology' | 'content' | 'solutions';
};

export type ThreeCardsIllustrationBenefitType = BodyType & {
  icon?:
    | 'book'
    | 'check'
    | 'code'
    | 'edit'
    | 'eye'
    | 'search'
    | 'tag'
    | 'users';
};

export type ThreeCardsIllustrationCardType = {
  heading: HeadingType;
  body: BodyType;
  benefits?: ThreeCardsIllustrationBenefitType[];
  action?: ThreeCardsIllustrationCardActionType;
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: ThreeCardsIllustrationId;
  caseStudySlug?: string;
};
