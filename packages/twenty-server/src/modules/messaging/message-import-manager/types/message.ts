import { type MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type WhatsappFile } from 'src/modules/message-attachment-creation-manager/types/whatsapp-file.type';

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
  | 'messageAttachments'
> & {
  attachments: WhatsappFile[] | string[];
  externalId: string;
  messageThreadExternalId: string;
  direction: MessageDirection;
};

export type MessageAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
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
