import { BodyType } from '@/design-system/components/Body/types/Body';
import { ThreeCardsBaseDataType } from './ThreeCardsBase';
import { ThreeCardsIllustrationCardType } from './ThreeCardsIllustrationCard';

export type ThreeCardsIllustrationDataType = ThreeCardsBaseDataType & {
  body: BodyType;
  illustrationCards: ThreeCardsIllustrationCardType[];
};
