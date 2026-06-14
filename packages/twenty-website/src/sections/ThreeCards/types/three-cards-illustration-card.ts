import type { MessageDescriptor } from '@lingui/core';
import { type ThreeCardsIllustrationCardAttributionType } from './three-cards-illustration-card-attribution';
import type { ThreeCardsIllustrationId } from './three-cards-illustration-id';

type ThreeCardsIllustrationBenefitType = {
  text: MessageDescriptor;
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
  heading: MessageDescriptor;
  body: MessageDescriptor;
  benefits?: ThreeCardsIllustrationBenefitType[];
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: ThreeCardsIllustrationId;
  caseStudySlug?: string;
};
