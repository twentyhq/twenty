import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { ImageType } from '@/design-system/components/Image/types/Image';

export type TestimonialAuthorType = {
  avatar?: ImageType;
  date?: Date | string;
  designation?: BodyType;
  handle?: BodyType;
  name: BodyType;
};
