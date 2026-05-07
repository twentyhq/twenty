import type { MessageEyebrow } from '@/lib/i18n/message-eyebrow';
import type { ProblemPointType } from './ProblemPoint';

export type ProblemDataType = {
  eyebrow: MessageEyebrow;
  points: ProblemPointType[];
};
