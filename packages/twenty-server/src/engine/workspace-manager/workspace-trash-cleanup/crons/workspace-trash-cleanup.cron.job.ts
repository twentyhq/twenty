import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { WORKSPACE_TRASH_CLEANUP_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-trash-cleanup/constants/workspace-trash-cleanup.constants';
import {
  WorkspaceTrashCleanupJob,
  type WorkspaceTrashCleanupJobData,
} from 'src/engine/workspace-manager/workspace-trash-cleanup/jobs/workspace-trash-cleanup.job';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class WorkspaceTrashCleanupCronJob {
  private readonly logger = new Logger(WorkspaceTrashCleanupCronJob.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
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

    await Promise.all(
      workspaces.map((workspace) =>
        this.messageQueueService.add<WorkspaceTrashCleanupJobData>(
          WorkspaceTrashCleanupJob.name,
          {
            workspaceId: workspace.id,
            schemaName: workspace.schema,
            trashRetentionDays: workspace.trashRetentionDays,
          },
          {
            priority: 10,
          },
        ),
      ),
    );

    this.logger.log(
      `Successfully enqueued ${workspaces.length} trash cleanup job(s)`,
    );
  }

  private async getActiveWorkspaces(): Promise<
    Array<{ id: string; trashRetentionDays: number; schema: string }>
  > {
    const rawResults = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin(
        DataSourceEntity,
        'dataSource',
        'dataSource.workspaceId = workspace.id',
      )
      .where('workspace.activationStatus = :status', {
        status: WorkspaceActivationStatus.ACTIVE,
      })
      .andWhere('workspace.trashRetentionDays >= :minDays', { minDays: 0 })
      .select([
        'workspace.id AS id',
        'workspace.trashRetentionDays AS "trashRetentionDays"',
        'dataSource.schema AS schema',
      ])
      .orderBy('workspace.id', 'ASC')
      .getRawMany();

    return rawResults;
  }
}
