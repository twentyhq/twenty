import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type Message = Omit<
  MessageWorkspaceEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'messageChannelMessageAssociations'
  | 'messageParticipants'
  | 'messageThread'
  | 'messageThreadId'
  | 'id'
> & {
  attachments: {
    filename: string;
  }[];
  externalId: string;
  messageThreadExternalId: string;
  direction: MessageDirection;
};

export type MessageParticipant = Omit<
  MessageParticipantWorkspaceEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'personId'
  | 'workspaceMemberId'
  | 'person'
  | 'workspaceMember'
  | 'message'
  | 'messageId'
>;

export type MessageWithParticipants = Message & {
  participants: MessageParticipant[];
};
