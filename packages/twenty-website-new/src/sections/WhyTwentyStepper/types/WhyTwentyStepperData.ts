import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { IllustrationId } from '@/illustrations';

export type WhyTwentyStepperDataType = {
  heading: HeadingType;
  body: BodyType[];
  illustration: IllustrationId;
};
