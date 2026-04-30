import { type EyebrowType } from '@/design-system/components/Eyebrow';
import { type HeadingType } from '@/design-system/components/Heading';
import { type FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

export type FaqDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  questions: FaqQuestionType[];
};
