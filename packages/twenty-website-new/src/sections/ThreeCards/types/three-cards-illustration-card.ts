import type { MessageDescriptor } from '@lingui/core';
import { type ThreeCardsIllustrationCardAttributionType } from './three-cards-illustration-card-attribution';
import type { ThreeCardsIllustrationId } from './three-cards-illustration-id';

type ThreeCardsIllustrationCardActionType = {
  kind: 'partnerApplication';
  label: MessageDescriptor;
  programId: 'technology' | 'content' | 'solutions';
};

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
  action?: ThreeCardsIllustrationCardActionType;
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: ThreeCardsIllustrationId;
  caseStudySlug?: string;
};
