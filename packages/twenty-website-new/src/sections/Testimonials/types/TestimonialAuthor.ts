import type { BodyType } from '@/design-system/components/Body/types/Body';

export type TestimonialAuthorType = {
  name: BodyType;
  designation: BodyType;
  avatar?: {
    src: string;
    alt?: string;
  };
  date?: Date;
};
