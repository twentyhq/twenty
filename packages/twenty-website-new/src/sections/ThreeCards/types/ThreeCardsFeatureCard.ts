import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { ImageType } from '@/design-system/components/Image/types/Image';

type ThreeCardsFeatureCardBaseType = {
  heading: HeadingType;
  body: BodyType;
  icon: 'fast-path' | 'live-data' | 'users-group';
};

type ThreeCardsFeatureCardImageType = {
  image: ImageType;
  illustration?: never;
};

type ThreeCardsFeatureCardIllustrationType = {
  illustration: 'familiar-interface' | 'fast-path' | 'live-data';
  image?: never;
};

export type ThreeCardsFeatureCardType = ThreeCardsFeatureCardBaseType &
  (ThreeCardsFeatureCardImageType | ThreeCardsFeatureCardIllustrationType);
