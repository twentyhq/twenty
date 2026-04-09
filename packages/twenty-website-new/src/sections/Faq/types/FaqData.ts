import { type EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { type HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { IllustrationId } from '@/illustrations';
import { type FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

export type FaqDataType = {
  illustration: IllustrationId;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  questions: FaqQuestionType[];
};
