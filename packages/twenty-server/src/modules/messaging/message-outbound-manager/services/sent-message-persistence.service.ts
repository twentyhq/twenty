import { Injectable, Logger } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

type PersistSentMessageInput = {
  sendResult: SendMessageResult;
  subject: string;
  body: string;
  recipients: { to: string[]; cc: string[]; bcc: string[] };
  connectedAccount: ConnectedAccountEntity;
  messageChannelId: string;
  inReplyTo?: string;
  workspaceId: string;
};

@Injectable()
export class SentMessagePersistenceService {
  private readonly logger = new Logger(SentMessagePersistenceService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async persistSentMessage(input: PersistSentMessageInput): Promise<void> {
    const authContext = buildSystemAuthContext(input.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
          input.workspaceId,
          'message',
        );

      const messageThreadRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
          input.workspaceId,
          'messageThread',
        );

      const messageParticipantRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
          input.workspaceId,
          'messageParticipant',
        );

      const associationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          input.workspaceId,
          'messageChannelMessageAssociation',
        );

      const messageThreadId = await this.findOrCreateThread({
        messageRepository,
        messageThreadRepository,
        inReplyTo: input.inReplyTo,
        subject: input.subject,
      });

      const messageId = v4();

      await messageRepository.insert({
        id: messageId,
        headerMessageId: input.sendResult.headerMessageId,
        subject: input.subject,
        text: input.body,
        receivedAt: new Date(),
        messageThreadId,
      });

      const participants = this.buildParticipants(
        messageId,
        input.connectedAccount.handle ?? '',
        input.recipients,
      );

      if (participants.length > 0) {
        await messageParticipantRepository.insert(participants);
      }

      await associationRepository.insert({
        messageChannelId: input.messageChannelId,
        messageId,
        messageExternalId: input.sendResult.messageExternalId ?? null,
        messageThreadExternalId: input.sendResult.threadExternalId ?? null,
        direction: MessageDirection.OUTGOING,
      });
    }, authContext);
  }

  private async findOrCreateThread({
    messageRepository,
    messageThreadRepository,
    inReplyTo,
    subject,
  }: {
    messageRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >;
    messageThreadRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >;
    inReplyTo?: string;
    subject: string;
  }): Promise<string> {
    if (inReplyTo) {
      const parentMessage = await messageRepository.findOne({
        where: { headerMessageId: inReplyTo },
      });

      if (parentMessage?.messageThreadId) {
        return parentMessage.messageThreadId;
      }
    }

    const threadId = v4();

    await messageThreadRepository.insert({
      id: threadId,
      subject,
    });

    return threadId;
  }

  private buildParticipants(
    messageId: string,
    senderHandle: string,
    recipients: { to: string[]; cc: string[]; bcc: string[] },
  ): Pick<
    MessageParticipantWorkspaceEntity,
    'messageId' | 'handle' | 'displayName' | 'role'
  >[] {
    const participants: Pick<
      MessageParticipantWorkspaceEntity,
      'messageId' | 'handle' | 'displayName' | 'role'
    >[] = [];

    participants.push({
      messageId,
      handle: senderHandle,
      displayName: senderHandle,
      role: MessageParticipantRole.FROM,
    });

    for (const email of recipients.to) {
      participants.push({
        messageId,
        handle: email,
        displayName: email,
        role: MessageParticipantRole.TO,
      });
    }

    for (const email of recipients.cc) {
      participants.push({
        messageId,
        handle: email,
        displayName: email,
        role: MessageParticipantRole.CC,
      });
    }

    for (const email of recipients.bcc) {
      participants.push({
        messageId,
        handle: email,
        displayName: email,
        role: MessageParticipantRole.BCC,
      });
    }

    return participants;
  }
}
