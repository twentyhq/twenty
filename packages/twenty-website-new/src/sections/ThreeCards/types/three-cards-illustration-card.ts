import type { MessageDescriptor } from '@lingui/core';
import { type ThreeCardsIllustrationCardAttributionType } from './three-cards-illustration-card-attribution';

export type ThreeCardsIllustrationId =
  | 'connect'
  | 'diamond'
  | 'eye'
  | 'flash'
  | 'grow'
  | 'lock'
  | 'programming'
  | 'singleScreen'
  | 'speed';

export type ThreeCardsIllustrationCardActionType = {
  kind: 'partnerApplication';
  label: MessageDescriptor;
  programId: 'technology' | 'content' | 'solutions';
};

export type ThreeCardsIllustrationBenefitType = {
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
