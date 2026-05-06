import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { MessageDescriptor } from '@lingui/core';
import { type ThreeCardsIllustrationCardAttributionType } from './ThreeCardsIllustrationCardAttribution';

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

export type ThreeCardsIllustrationBenefitType = MessageBody & {
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
  heading: MessageHeadingSegment;
  body: MessageBody;
  benefits?: ThreeCardsIllustrationBenefitType[];
  action?: ThreeCardsIllustrationCardActionType;
  attribution?: ThreeCardsIllustrationCardAttributionType;
  illustration: ThreeCardsIllustrationId;
  caseStudySlug?: string;
};
