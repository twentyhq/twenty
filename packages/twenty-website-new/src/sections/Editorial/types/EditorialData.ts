import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';

export type EditorialDataType = {
  eyebrow?: MessageEyebrow;
  heading?: MessageHeadingSegment | MessageHeadingSegment[];
  body: MessageBody | MessageBody[];
};
