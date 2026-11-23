import { Injectable, type OnModuleInit } from '@nestjs/common';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@Injectable()
export class ApplyMessageThreadsVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'messageThread',
      handler: this,
    });
  }

  // The stored subject copies the latest message, so it is rebuilt from the messages the reader can read
  public async applyVisibilityRestrictions({
    records,
    authContext,
  }: Parameters<
    RecordVisibilityRestrictionHandler['applyVisibilityRestrictions']
  >[0]): Promise<void> {
    const messageThreads = records.filter(
      (messageThread) =>
        'subject' in messageThread && isDefined(messageThread.id),
    );

    if (!isNonEmptyArray(messageThreads)) {
      return;
    }

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      authContext.workspace.id,
      ['featureFlagsMap'],
    );

    if (!isChannelVisibilityRlsEnabled(featureFlagsMap)) {
      return;
    }

    const readableSubjectByMessageThreadId =
      await this.findLatestReadableSubjectByMessageThreadId({
        messageThreadIds: messageThreads.map(({ id }) => id),
        authContext,
      });

    for (const messageThread of messageThreads) {
      messageThread.subject =
        readableSubjectByMessageThreadId.get(messageThread.id) ??
        FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
    }
  }

  private async findLatestReadableSubjectByMessageThreadId({
    messageThreadIds,
    authContext,
  }: {
    messageThreadIds: string[];
    authContext: WorkspaceAuthContext;
  }): Promise<Map<string, string>> {
    const readableSubjectByMessageThreadId = new Map<string, string>();
    const messages = await this.findReadableMessages({
      messageThreadIds,
      authContext,
    });

    for (const { messageThreadId, subject } of messages) {
      if (
        isDefined(messageThreadId) &&
        isDefined(subject) &&
        subject !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
        !readableSubjectByMessageThreadId.has(messageThreadId)
      ) {
        readableSubjectByMessageThreadId.set(messageThreadId, subject);
      }
    }

    return readableSubjectByMessageThreadId;
  }

  private async findReadableMessages({
    messageThreadIds,
    authContext,
  }: {
    messageThreadIds: string[];
    authContext: WorkspaceAuthContext;
  }): Promise<Pick<MessageWorkspaceEntity, 'messageThreadId' | 'subject'>[]> {
    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<MessageWorkspaceEntity>('message')
            .find({
              select: ['messageThreadId', 'subject'],
              where: { messageThreadId: In(messageThreadIds) },
              order: { receivedAt: 'DESC' },
            }),
        authContext,
      );
    } catch (error) {
      if (error instanceof PermissionsException) {
        return [];
      }

      throw error;
    }
  }
}
