import type { MessageDescriptor } from '@lingui/core';
import type { ImageType } from '@/design-system/components/Image';

type ThreeCardsFeatureCardBaseType = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  backgroundImageSrc?: string;
  backgroundImageRotationDeg?: number;
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
