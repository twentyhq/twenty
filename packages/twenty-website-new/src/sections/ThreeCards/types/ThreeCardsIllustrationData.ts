import type { MessageBody } from '@/lib/i18n/message-body';
import type { ThreeCardsBaseDataType } from './ThreeCardsBase';
import type { ThreeCardsIllustrationCardType } from './ThreeCardsIllustrationCard';

export type ThreeCardsIllustrationDataType = ThreeCardsBaseDataType & {
  body?: MessageBody;
  illustrationCards: ThreeCardsIllustrationCardType[];
};
