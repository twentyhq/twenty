import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';

export type FaqQuestionType = {
  question: MessageHeadingSegment;
  answer: MessageBody;
};
