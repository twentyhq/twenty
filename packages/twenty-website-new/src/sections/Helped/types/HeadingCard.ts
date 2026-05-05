import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';

export type HelpedVisualId = 'money' | 'spaceship' | 'target';

export type HeadingCardType = {
  icon: string;
  illustration: HelpedVisualId;
  heading: MessageHeadingSegment;
  body: MessageBody;
  href: string;
};
