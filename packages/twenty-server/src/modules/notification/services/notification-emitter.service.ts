import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';
import { v4 } from 'uuid';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type NotificationPayload,
  NotificationWorkspaceEntity,
} from 'src/modules/notification/standard-objects/notification.workspace-entity';

export type EmitToWorkspaceMembersArgs = {
  workspaceId: string;
  workspaceMemberIds: string[];
  type: string;
  title: string;
  preview?: string;
  requiresAction?: boolean;
  threadId?: string;
  subjectRecordId?: string;
  payload?: NotificationPayload;
  dedupeKey?: string;
};

@Injectable()
export class NotificationEmitterService {
  private readonly logger = new Logger(NotificationEmitterService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async emitToWorkspaceMembers({
    workspaceId,
    workspaceMemberIds,
    type,
    title,
    preview,
    requiresAction,
    threadId,
    subjectRecordId,
    payload,
    dedupeKey,
  }: EmitToWorkspaceMembersArgs): Promise<void> {
    if (workspaceMemberIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    // Notification failures must never break the caller
    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const notificationRepository =
            await this.globalWorkspaceOrmManager.getRepository<NotificationWorkspaceEntity>(
              workspaceId,
              NotificationWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          for (const workspaceMemberId of workspaceMemberIds) {
            try {
              await this.emitToWorkspaceMember({
                notificationRepository,
                workspaceMemberId,
                type,
                title,
                preview,
                requiresAction,
                threadId,
                subjectRecordId,
                payload,
                dedupeKey,
              });
            } catch (error) {
              this.logWarning({ type, workspaceId, error, workspaceMemberId });
            }
          }
        },
        authContext,
      );
    } catch (error) {
      this.logWarning({ type, workspaceId, error });
    }
  }

  private async emitToWorkspaceMember({
    notificationRepository,
    workspaceMemberId,
    type,
    title,
    preview,
    requiresAction,
    threadId,
    subjectRecordId,
    payload,
    dedupeKey,
  }: Omit<EmitToWorkspaceMembersArgs, 'workspaceId' | 'workspaceMemberIds'> & {
    notificationRepository: WorkspaceRepository<NotificationWorkspaceEntity>;
    workspaceMemberId: string;
  }): Promise<void> {
    if (isDefined(dedupeKey)) {
      const existingNotification = await notificationRepository.findOne({
        where: {
          dedupeKey,
          workspaceMemberId,
          status: Not('DONE'),
        },
      });

      if (isDefined(existingNotification)) {
        await notificationRepository.update(existingNotification.id, {
          title,
          preview: preview ?? null,
          payload: payload ?? null,
          ...(isDefined(requiresAction) ? { requiresAction } : {}),
          status: 'UNREAD',
        });

        return;
      }
    }

    await notificationRepository.insert({
      id: v4(),
      type,
      title,
      preview: preview ?? null,
      payload: payload ?? null,
      requiresAction: requiresAction ?? false,
      status: 'UNREAD',
      dedupeKey: dedupeKey ?? null,
      threadId: threadId ?? null,
      subjectRecordId: subjectRecordId ?? null,
      workspaceMemberId,
    });
  }

  private logWarning({
    type,
    workspaceId,
    error,
    workspaceMemberId,
  }: {
    type: string;
    workspaceId: string;
    error: unknown;
    workspaceMemberId?: string;
  }): void {
    const recipient = isDefined(workspaceMemberId)
      ? ` to workspace member ${workspaceMemberId}`
      : '';

    this.logger.warn(
      `Failed to emit notification of type ${type}${recipient} in workspace ${workspaceId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
