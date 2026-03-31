import { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

export type FaqDataType = {
  illustration: IllustrationType;
  eyebrow: EyebrowType;
  heading: HeadingType[];
  questions: FaqQuestionType[];
};
