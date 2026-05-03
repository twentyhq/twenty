import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { type FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

export type FaqDataType = {
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
  questions: FaqQuestionType[];
};
