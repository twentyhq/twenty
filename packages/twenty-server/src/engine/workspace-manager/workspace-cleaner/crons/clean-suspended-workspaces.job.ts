import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { cleanSuspendedWorkspaceCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.cron.pattern';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

const CLEAN_SUSPENDED_WORKSPACES_LOCK_NAME = 'clean-suspended-workspaces-job';

@Processor(MessageQueue.cronQueue)
export class CleanSuspendedWorkspacesJob {
  private readonly logger = new Logger(CleanSuspendedWorkspacesJob.name);

  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  @SentryCronMonitor(
    CleanSuspendedWorkspacesJob.name,
    cleanSuspendedWorkspaceCronPattern,
  )
  async handle(): Promise<void> {
    const result = await this.postgresAdvisoryLockService.tryWithLock(
      CLEAN_SUSPENDED_WORKSPACES_LOCK_NAME,
      async () => {
        const suspendedWorkspaceIds = await this.workspaceRepository.find({
          select: ['id'],
          where: {
            activationStatus: WorkspaceActivationStatus.SUSPENDED,
          },
          withDeleted: true,
        });

        await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces({
          workspaceIds: suspendedWorkspaceIds.map((workspace) => workspace.id),
        });
      },
    );

    if (!result.acquired) {
      this.logger.log(
        'Skipping suspended workspace cleanup because another execution is running',
      );
    }
  }
}
