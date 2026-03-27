import { ThreeCardsBaseDataType } from './ThreeCardsBase';
import { ThreeCardsFeatureCardType } from './ThreeCardsFeatureCard';

export type ThreeCardsFeatureCardsDataType = ThreeCardsBaseDataType & {
  featureCards: ThreeCardsFeatureCardType[];
};
