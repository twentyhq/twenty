import { BodyType } from '@/design-system/components/Body/types/Body';
import { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';

export type EditorialDataType = {
  eyebrow?: EyebrowType;
  heading?: HeadingType | HeadingType[];
  body: BodyType | BodyType[];
};
