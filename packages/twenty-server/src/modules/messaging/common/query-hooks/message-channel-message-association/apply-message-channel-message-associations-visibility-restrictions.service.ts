import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

@Injectable()
export class ApplyMessageChannelMessageAssociationsVisibilityRestrictionsService
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
      objectNameSingular: 'messageChannelMessageAssociation',
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
    const associationsWithReadState = records.filter(
      (association) => 'isRead' in association && isDefined(association.id),
    );

    if (associationsWithReadState.length === 0) {
      return;
    }

    const ownedAssociationIds = await this.findOwnedAssociationIds({
      associationIds: associationsWithReadState.map(({ id }) => id),
      authContext,
    });

    for (const association of associationsWithReadState) {
      if (!ownedAssociationIds.has(association.id)) {
        association.isRead = true;
      }
    }
  }

  private async findOwnedAssociationIds({
    associationIds,
    authContext,
  }: {
    associationIds: string[];
    authContext: WorkspaceAuthContext;
  }): Promise<Set<string>> {
    const workspaceId = authContext.workspace.id;

    const associations =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
              'messageChannelMessageAssociation',
            )
            .find({
              where: { id: In([...new Set(associationIds)]) },
              select: { id: true, messageChannelId: true },
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    const messageChannelIds = [
      ...new Set(associations.map(({ messageChannelId }) => messageChannelId)),
    ];

    if (messageChannelIds.length === 0) {
      return new Set();
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { id: In(messageChannelIds), workspaceId },
      select: {
        id: true,
        connectedAccount: {
          id: true,
          userWorkspaceId: true,
          applicationId: true,
        },
      },
      relations: { connectedAccount: true },
    });

    const ownedMessageChannelIds = new Set(
      messageChannels
        .filter((messageChannel) =>
          this.isConnectedAccountOwnedByViewer({
            connectedAccount: messageChannel.connectedAccount,
            authContext,
          }),
        )
        .map(({ id }) => id),
    );

    return new Set(
      associations
        .filter(({ messageChannelId }) =>
          ownedMessageChannelIds.has(messageChannelId),
        )
        .map(({ id }) => id),
    );
  }

  private isConnectedAccountOwnedByViewer({
    connectedAccount,
    authContext,
  }: {
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'userWorkspaceId' | 'applicationId'
    >;
    authContext: WorkspaceAuthContext;
  }): boolean {
    if (isUserAuthContext(authContext)) {
      return connectedAccount.userWorkspaceId === authContext.userWorkspaceId;
    }

    if (isApplicationAuthContext(authContext)) {
      return connectedAccount.applicationId === authContext.application.id;
    }

    return false;
  }
}
