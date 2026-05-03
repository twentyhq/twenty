import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';

export type HelpedDataType = {
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
  cards: HeadingCardType[];
};
