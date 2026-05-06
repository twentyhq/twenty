import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';

export type ProblemPointType = {
  heading: MessageHeadingSegment;
  body: MessageBody;
};
