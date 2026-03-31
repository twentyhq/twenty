import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';

export type HelpedDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  cards: HeadingCardType[];
};
