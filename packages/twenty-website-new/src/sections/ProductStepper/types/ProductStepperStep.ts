import type { BodyType } from '@/design-system/components/Body';
import type { HeadingType } from '@/design-system/components/Heading';
import type { ImageType } from '@/design-system/components/Image';

export type ProductStepperStepType = {
  body: BodyType;
  heading: HeadingType;
  icon: string;
  image: ImageType;
};
