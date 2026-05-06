import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { ImageType } from '@/design-system/components/Image';

type ThreeCardsFeatureCardBaseType = {
  heading: MessageHeadingSegment;
  body: MessageBody;
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
