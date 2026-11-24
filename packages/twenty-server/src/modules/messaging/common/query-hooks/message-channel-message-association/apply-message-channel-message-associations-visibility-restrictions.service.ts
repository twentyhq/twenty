import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { isConnectedAccountOwnedByViewer } from 'src/modules/messaging/common/utils/is-connected-account-owned-by-viewer.util';

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
      (association) => 'isRead' in association,
    );

    if (associationsWithReadState.length === 0) {
      return;
    }

    const associationIds = associationsWithReadState
      .map(({ id }) => id)
      .filter(isDefined);

    const ownedAssociationIds =
      associationIds.length > 0
        ? await this.findOwnedAssociationIds({ associationIds, authContext })
        : new Set<string>();

    // without its id an association cannot be proven owned, so its read state stays masked
    for (const association of associationsWithReadState) {
      if (
        !isDefined(association.id) ||
        !ownedAssociationIds.has(association.id)
      ) {
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
          isConnectedAccountOwnedByViewer({
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
}
