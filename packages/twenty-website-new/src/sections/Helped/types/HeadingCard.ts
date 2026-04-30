import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';

export type HelpedVisualId = 'money' | 'spaceship' | 'target';

export type HeadingCardType = {
  icon: string;
  illustration: HelpedVisualId;
  heading: HeadingType;
  body: BodyType;
  href: string;
};
