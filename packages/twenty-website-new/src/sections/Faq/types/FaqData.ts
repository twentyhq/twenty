import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import { type FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

export type FaqDataType = {
  eyebrow: MessageEyebrow;
  questions: FaqQuestionType[];
};
