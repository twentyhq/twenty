import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKSPACE_TRASH_CLEANUP_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-trash-cleanup/constants/workspace-trash-cleanup.constants';
import {
  WorkspaceTrashCleanupJob,
  type WorkspaceTrashCleanupJobData,
} from 'src/engine/workspace-manager/workspace-trash-cleanup/jobs/workspace-trash-cleanup.job';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class WorkspaceTrashCleanupCronJob {
  private readonly logger = new Logger(WorkspaceTrashCleanupCronJob.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkspaceTrashCleanupCronJob.name)
  @SentryCronMonitor(
    WorkspaceTrashCleanupCronJob.name,
    WORKSPACE_TRASH_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaces = await this.getActiveWorkspaces();

    if (workspaces.length === 0) {
      this.logger.log('No active workspaces found for trash cleanup');

      return;
    }

    this.logger.log(
      `Enqueuing trash cleanup jobs for ${workspaces.length} workspace(s)`,
    );

    for (const workspace of workspaces) {
      try {
        await this.messageQueueService.add<WorkspaceTrashCleanupJobData>(
          WorkspaceTrashCleanupJob.name,
          {
            workspaceId: workspace.id,
            schemaName: workspace.schema,
            trashRetentionDays: workspace.trashRetentionDays,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspace.id,
          },
        });
      }
    }

    this.logger.log(
      `Successfully enqueued ${workspaces.length} trash cleanup job(s)`,
    );
  }

  private async getActiveWorkspaces(): Promise<
    Array<{ id: string; trashRetentionDays: number; schema: string }>
  > {
    const workspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id', 'trashRetentionDays'],
      order: { id: 'ASC' },
    });

    if (workspaces.length === 0) {
      return [];
    }

    return workspaces.map((workspace) => ({
      id: workspace.id,
      trashRetentionDays: workspace.trashRetentionDays,
      schema: getWorkspaceSchemaName(workspace.id),
    }));
  }
}
