import { BodyType } from '@/design-system/components/Body';
import { EyebrowType } from '@/design-system/components/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading';

export type EditorialDataType = {
  eyebrow?: EyebrowType;
  heading?: HeadingType | HeadingType[];
  body: BodyType | BodyType[];
};
