import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import type { ProblemPointType } from './ProblemPoint';

export type ProblemDataType = {
  eyebrow: MessageEyebrow;
  heading: MessageHeadingSegment[];
  points: ProblemPointType[];
};
