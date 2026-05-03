import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';

export type ThreeCardsBaseDataType = {
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
};
