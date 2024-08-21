import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type Message = Omit<
  MessageWorkspaceEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'messageChannelMessageAssociations'
  | 'messageParticipants'
  | 'messageThread'
  | 'id'
>;

export type MessageParticipant = Omit<
  MessageParticipantWorkspaceEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'personId'
  | 'workspaceMemberId'
  | 'person'
  | 'workspaceMember'
  | 'message'
  | 'messageId'
>;

export type MessageWithParticipants = Message & {
  externalId: string;
  participants: MessageParticipant[];
  status: string;
};
