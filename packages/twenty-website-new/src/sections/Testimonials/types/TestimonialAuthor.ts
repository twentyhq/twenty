import type { BodyType } from '@/design-system/components/Body';

export type TestimonialAuthorType = {
  name: BodyType;
  designation: BodyType;
  avatar?: {
    src: string;
    alt?: string;
  };
  date?: Date;
};
