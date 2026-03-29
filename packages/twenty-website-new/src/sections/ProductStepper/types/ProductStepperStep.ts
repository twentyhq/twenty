import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ImageType } from '@/design-system/components/Image/types/Image';

export type ProductStepperStepType = {
  body: BodyType;
  heading: HeadingType;
  icon: string;
  image: ImageType;
};
