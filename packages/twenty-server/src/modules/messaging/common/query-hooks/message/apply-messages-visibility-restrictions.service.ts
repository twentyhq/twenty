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
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

const RESTRICTED_MESSAGE_FIELD_NAMES = ['subject', 'text'];

type MessageVisibility = 'FULL' | 'SUBJECT' | 'METADATA';

const MESSAGE_VISIBILITY_RANK: Record<MessageVisibility, number> = {
  METADATA: 0,
  SUBJECT: 1,
  FULL: 2,
};

@Injectable()
export class ApplyMessagesVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler('message', this);
  }

  public async applyVisibilityRestrictions(
    messages: ObjectRecord[],
    authContext: WorkspaceAuthContext,
  ): Promise<void> {
    const restrictableMessages = messages.filter((message) =>
      RESTRICTED_MESSAGE_FIELD_NAMES.some((fieldName) => fieldName in message),
    );

    if (restrictableMessages.length === 0) {
      return;
    }

    const visibilityByMessageId = await this.computeVisibilityByMessageId(
      restrictableMessages,
      authContext,
    );

    for (const message of restrictableMessages) {
      const visibility = visibilityByMessageId.get(message.id) ?? 'METADATA';

      if (visibility === 'FULL') {
        continue;
      }

      if ('text' in message) {
        message.text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }

      if (visibility === 'METADATA' && 'subject' in message) {
        message.subject = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
      }
    }
  }

  private async computeVisibilityByMessageId(
    messages: ObjectRecord[],
    authContext: WorkspaceAuthContext,
  ): Promise<Map<string, MessageVisibility>> {
    const workspaceId = authContext.workspace.id;

    const messageIds = [
      ...new Set(messages.map((message) => message.id)),
    ].filter(isDefined);

    if (messageIds.length === 0) {
      return new Map();
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
      return new Map();
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { id: In(messageChannelIds), workspaceId },
      select: ['id', 'visibility', 'connectedAccountId'],
    });

    const ownedConnectedAccountIds = await this.findOwnedConnectedAccountIds(
      messageChannels.filter(
        (messageChannel) =>
          messageChannel.visibility !==
          MessageChannelVisibility.SHARE_EVERYTHING,
      ),
      authContext,
    );

    const visibilityByMessageChannelId = new Map<string, MessageVisibility>(
      messageChannels.map((messageChannel) => [
        messageChannel.id,
        this.computeMessageChannelVisibility(
          messageChannel,
          ownedConnectedAccountIds,
        ),
      ]),
    );

    const visibilityByMessageId = new Map<string, MessageVisibility>();

    for (const association of messageChannelMessageAssociations) {
      const channelVisibility = visibilityByMessageChannelId.get(
        association.messageChannelId,
      );
      const currentVisibility = visibilityByMessageId.get(
        association.messageId,
      );

      if (
        !isDefined(channelVisibility) ||
        (isDefined(currentVisibility) &&
          MESSAGE_VISIBILITY_RANK[currentVisibility] >=
            MESSAGE_VISIBILITY_RANK[channelVisibility])
      ) {
        continue;
      }

      visibilityByMessageId.set(association.messageId, channelVisibility);
    }

    return visibilityByMessageId;
  }

  private computeMessageChannelVisibility(
    messageChannel: MessageChannelEntity,
    ownedConnectedAccountIds: Set<string>,
  ): MessageVisibility {
    if (
      messageChannel.visibility === MessageChannelVisibility.SHARE_EVERYTHING ||
      ownedConnectedAccountIds.has(messageChannel.connectedAccountId)
    ) {
      return 'FULL';
    }

    return messageChannel.visibility === MessageChannelVisibility.SUBJECT
      ? 'SUBJECT'
      : 'METADATA';
  }

  private async findOwnedConnectedAccountIds(
    messageChannels: MessageChannelEntity[],
    authContext: WorkspaceAuthContext,
  ): Promise<Set<string>> {
    if (messageChannels.length === 0) {
      return new Set();
    }

    // Email connections carry no applicationId, so an application only sees through channels it created itself
    const ownerCondition = isUserAuthContext(authContext)
      ? { userWorkspaceId: authContext.userWorkspaceId }
      : isApplicationAuthContext(authContext)
        ? { applicationId: authContext.application.id }
        : undefined;

    if (!isDefined(ownerCondition)) {
      return new Set();
    }

    const ownedConnectedAccounts = await this.connectedAccountRepository.find({
      where: {
        id: In(
          messageChannels.map(
            (messageChannel) => messageChannel.connectedAccountId,
          ),
        ),
        workspaceId: authContext.workspace.id,
        ...ownerCondition,
      },
      select: ['id'],
    });

    return new Set(
      ownedConnectedAccounts.map((connectedAccount) => connectedAccount.id),
    );
  }
}
