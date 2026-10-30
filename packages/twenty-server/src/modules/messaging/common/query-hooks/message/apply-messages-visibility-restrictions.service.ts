import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  MessageChannelVisibility,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

const RESTRICTED_MESSAGE_FIELD_NAMES = ['subject', 'text'];

@Injectable()
export class ApplyMessagesVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'message',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    authContext,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const restrictableMessages = records.filter((message) =>
      RESTRICTED_MESSAGE_FIELD_NAMES.some((fieldName) => fieldName in message),
    );

    if (restrictableMessages.length === 0) {
      return;
    }

    const { fullyVisibleMessageIds, subjectVisibleMessageIds } =
      await this.findVisibleMessageIds({
        messages: restrictableMessages,
        authContext,
      });

    for (const message of restrictableMessages) {
      if (fullyVisibleMessageIds.has(message.id)) {
        continue;
      }

      if ('text' in message) {
        message.text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }

      if (!subjectVisibleMessageIds.has(message.id) && 'subject' in message) {
        message.subject = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }
    }
  }

  private async findVisibleMessageIds({
    messages,
    authContext,
  }: {
    messages: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<{
    fullyVisibleMessageIds: Set<string>;
    subjectVisibleMessageIds: Set<string>;
  }> {
    const workspaceId = authContext.workspace.id;
    const fullyVisibleMessageIds = new Set<string>();
    const subjectVisibleMessageIds = new Set<string>();

    const messageIds = [
      ...new Set(messages.map((message) => message.id)),
    ].filter(isDefined);

    if (messageIds.length === 0) {
      return { fullyVisibleMessageIds, subjectVisibleMessageIds };
    }

    const messageChannelMessageAssociations =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
              'messageChannelMessageAssociation',
              { shouldBypassPermissionChecks: true },
            )
            .find({
              where: { messageId: In(messageIds) },
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    const messageChannelIds = [
      ...new Set(
        messageChannelMessageAssociations.map(
          (association) => association.messageChannelId,
        ),
      ),
    ];

    if (messageChannelIds.length === 0) {
      return { fullyVisibleMessageIds, subjectVisibleMessageIds };
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { id: In(messageChannelIds), workspaceId },
      select: {
        id: true,
        visibility: true,
        connectedAccount: {
          id: true,
          userWorkspaceId: true,
          applicationId: true,
        },
      },
      relations: { connectedAccount: true },
    });

    const messageChannelById = new Map(
      messageChannels.map((messageChannel) => [
        messageChannel.id,
        messageChannel,
      ]),
    );

    for (const association of messageChannelMessageAssociations) {
      const messageChannel = messageChannelById.get(
        association.messageChannelId,
      );

      if (!isDefined(messageChannel)) {
        continue;
      }

      if (
        messageChannel.visibility ===
          MessageChannelVisibility.SHARE_EVERYTHING ||
        this.isMessageChannelOwnedByViewer({ messageChannel, authContext })
      ) {
        fullyVisibleMessageIds.add(association.messageId);
      } else if (
        messageChannel.visibility === MessageChannelVisibility.SUBJECT
      ) {
        subjectVisibleMessageIds.add(association.messageId);
      }
    }

    return { fullyVisibleMessageIds, subjectVisibleMessageIds };
  }

  private isMessageChannelOwnedByViewer({
    messageChannel,
    authContext,
  }: {
    messageChannel: MessageChannelEntity;
    authContext: WorkspaceAuthContext;
  }): boolean {
    if (isUserAuthContext(authContext)) {
      return (
        messageChannel.connectedAccount.userWorkspaceId ===
        authContext.userWorkspaceId
      );
    }

    // Email connections carry no applicationId, so an application only sees through channels it created itself
    if (isApplicationAuthContext(authContext)) {
      return (
        messageChannel.connectedAccount.applicationId ===
        authContext.application.id
      );
    }

    return false;
  }
}
