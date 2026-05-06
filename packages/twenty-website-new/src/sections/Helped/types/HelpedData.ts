import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';

export type HelpedDataType = {
  eyebrow: MessageEyebrow;
  cards: HeadingCardType[];
};
