import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';

export type HeadingCardType = {
  icon: string;
  illustration: IllustrationType & { color: string };
  heading: HeadingType;
  body: BodyType;
};
