import { type MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';

export class MessageSuppressionWorkspaceEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId: string | null;
  unsubscribeTopicId: string | null;
}
