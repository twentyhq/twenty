import { Injectable } from '@nestjs/common';

import { EntityManager, DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import {
  GmailMessage,
  Participant,
} from 'src/workspace/messaging/types/gmail-message';
import { MessageQuery } from 'src/workspace/messaging/types/message-or-thread-query';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/message-channel-message-association/message-channel-message-association.service';
import { MessageService } from 'src/workspace/messaging/message/message.service';
import { MessageThreadService } from 'src/workspace/messaging/message-thread/message-thread.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company.service';

@Injectable()
export class MessagingUtilsService {
  constructor(
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly messageService: MessageService,
    private readonly messageThreadService: MessageThreadService,
    private readonly createCompaniesService: CreateCompanyService,
  ) {}

  public createQueriesFromMessageIds(
    messageExternalIds: string[],
  ): MessageQuery[] {
    return messageExternalIds.map((messageId) => ({
      uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
    }));
  }

  public async saveMessages(
    messages: GmailMessage[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    gmailMessageChannelId: string,
    workspaceId: string,
  ) {
    for (const message of messages) {
      await workspaceDataSource?.transaction(async (manager: EntityManager) => {
        const existingMessageChannelMessageAssociationsCount =
          await this.messageChannelMessageAssociationService.countByMessageExternalIdsAndMessageChannelId(
            [message.externalId],
            gmailMessageChannelId,
            workspaceId,
            manager,
          );

        if (existingMessageChannelMessageAssociationsCount > 0) {
          return;
        }

        const savedOrExistingMessageThreadId =
          await this.saveMessageThreadOrReturnExistingMessageThread(
            message.messageThreadExternalId,
            dataSourceMetadata,
            workspaceId,
            manager,
          );

        const savedOrExistingMessageId =
          await this.saveMessageOrReturnExistingMessage(
            message,
            savedOrExistingMessageThreadId,
            connectedAccount,
            dataSourceMetadata,
            workspaceId,
            manager,
          );

        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."messageChannelMessageAssociation" ("messageChannelId", "messageId", "messageExternalId", "messageThreadId", "messageThreadExternalId") VALUES ($1, $2, $3, $4, $5)`,
          [
            gmailMessageChannelId,
            savedOrExistingMessageId,
            message.externalId,
            savedOrExistingMessageThreadId,
            message.messageThreadExternalId,
          ],
        );
      });
    }
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage = await this.messageService.getFirstByHeaderMessageId(
      message.headerMessageId,
      workspaceId,
    );
    const existingMessageId = existingMessage?.id;

    if (existingMessageId) {
      return Promise.resolve(existingMessageId);
    }

    const newMessageId = v4();

    const messageDirection =
      connectedAccount.handle === message.fromHandle ? 'outgoing' : 'incoming';

    const receivedAt = new Date(parseInt(message.internalDate));

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."message" ("id", "headerMessageId", "subject", "receivedAt", "direction", "messageThreadId", "text", "html") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newMessageId,
        message.headerMessageId,
        message.subject,
        receivedAt,
        messageDirection,
        messageThreadId,
        message.text,
        message.html,
      ],
    );

    await this.saveMessageParticipants(
      message.participants,
      newMessageId,
      dataSourceMetadata,
      manager,
    );

    return Promise.resolve(newMessageId);
  }

  private async saveMessageThreadOrReturnExistingMessageThread(
    messageThreadExternalId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    manager: EntityManager,
  ) {
    const existingMessageChannelMessageAssociationByMessageThreadExternalId =
      await this.messageChannelMessageAssociationService.getFirstByMessageThreadExternalId(
        messageThreadExternalId,
        workspaceId,
        manager,
      );

    const existingMessageThread =
      existingMessageChannelMessageAssociationByMessageThreadExternalId?.messageThreadId;

    if (existingMessageThread) {
      return Promise.resolve(existingMessageThread);
    }

    const newMessageThreadId = v4();

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."messageThread" ("id") VALUES ($1)`,
      [newMessageThreadId],
    );

    return Promise.resolve(newMessageThreadId);
  }

  private async saveMessageParticipants(
    participants: Participant[],
    messageId: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    for (const participant of participants) {
      const participantPerson = await manager.query(
        `SELECT "person"."id" FROM ${dataSourceMetadata.schema}."person" WHERE "email" = $1 LIMIT 1`,
        [participant.handle],
      );

      const participantPersonId = participantPerson[0]?.id;

      const workspaceMember = await manager.query(
        `SELECT "workspaceMember"."id" FROM ${dataSourceMetadata.schema}."workspaceMember"
          JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = $1
          LIMIT 1`,
        [participant.handle],
      );

      const participantWorkspaceMemberId = workspaceMember[0]?.id;

      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          messageId,
          participant.role,
          participant.handle,
          participant.displayName,
          participantPersonId,
          participantWorkspaceMemberId,
        ],
      );

      const companyDomainName = participant.handle
        .split('@')?.[1]
        .split('.')
        .slice(-2)
        .join('.')
        .toLowerCase();

      await this.createCompaniesService.createCompanyFromDomainName(
        companyDomainName,
        dataSourceMetadata,
        manager,
      );
    }
  }

  public async deleteMessages(
    workspaceDataSource: DataSource,
    messagesDeletedMessageExternalIds: string[],
    gmailMessageChannelId: string,
    workspaceId: string,
  ) {
    await workspaceDataSource?.transaction(async (manager: EntityManager) => {
      const messageChannelMessageAssociationsToDelete =
        await this.messageChannelMessageAssociationService.getByMessageExternalIdsAndMessageChannelId(
          messagesDeletedMessageExternalIds,
          gmailMessageChannelId,
          workspaceId,
          manager,
        );

      const messageChannelMessageAssociationIdsToDeleteIds =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.id,
        );

      await this.messageChannelMessageAssociationService.deleteByIds(
        messageChannelMessageAssociationIdsToDeleteIds,
        workspaceId,
        manager,
      );

      const messageIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageId,
        );

      const messageChannelMessageAssociationByMessageIds =
        await this.messageChannelMessageAssociationService.getByMessageIds(
          messageIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const messageIdsFromMessageChannelMessageAssociationByMessageIds =
        messageChannelMessageAssociationByMessageIds.map(
          (messageChannelMessageAssociation) =>
            messageChannelMessageAssociation.messageId,
        );

      const messageIdsToDelete =
        messageIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (messageId) =>
            !messageIdsFromMessageChannelMessageAssociationByMessageIds.includes(
              messageId,
            ),
        );

      await this.messageService.deleteByIds(
        messageIdsToDelete,
        workspaceId,
        manager,
      );

      const messageThreadIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageThreadId,
        );

      const messagesByThreadIds =
        await this.messageService.getByMessageThreadIds(
          messageThreadIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const threadIdsToDelete =
        messageThreadIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (threadId) =>
            !messagesByThreadIds.find(
              (message) => message.messageThreadId === threadId,
            ),
        );

      await this.messageThreadService.deleteByIds(
        threadIdsToDelete,
        workspaceId,
        manager,
      );
    });
  }
}
