import { type MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type Message = Omit<
  MessageWorkspaceEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'messageChannelMessageAssociations'
  | 'messageParticipants'
  | 'messageThread'
  | 'messageThreadId'
  | 'messageFolders'
  | 'id'
  | 'messageCampaign'
  | 'messageCampaignId'
> & {
  attachments: {
    filename: string;
  }[];
  externalId: string;
  messageThreadExternalId: string;
  direction: MessageDirection;
  messageFolderIds?: string[];
  messageFolderExternalIds?: string[];
  labelIds?: string[];
  messageHeaders?: MessageHeader[];
};

export type MessageHeader = {
  name: string;
  value: string;
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
  | 'messageCampaign'
  | 'messageCampaignId'
> &
  ExplicitParticipantIdentity;

// Email providers leave these unset and the email matcher fills them in
// afterwards. A source whose handles are not email addresses supplies them
// up front instead, because nothing can derive them from the handle.
export type ExplicitParticipantIdentity = {
  personId?: string | null;
  workspaceMemberId?: string | null;
};

export type MessageWithParticipants = Message & {
  participants: MessageParticipant[];
};
