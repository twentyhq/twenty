import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';

export type EditorialDataType = {
  eyebrow?: MessageEyebrow;
  body: MessageBody | MessageBody[];
};
