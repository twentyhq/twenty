import type { ThreeCardsBaseDataType } from './ThreeCardsBase';
import type { ThreeCardsFeatureCardType } from './ThreeCardsFeatureCard';

export type ThreeCardsFeatureCardsDataType = ThreeCardsBaseDataType & {
  featureCards: ThreeCardsFeatureCardType[];
};
