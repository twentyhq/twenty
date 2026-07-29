import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, type QueryRunner, Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

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
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  @SentryCronMonitor(
    CleanSuspendedWorkspacesJob.name,
    cleanSuspendedWorkspaceCronPattern,
  )
  async handle(): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    let isLockAcquired = false;

    try {
      isLockAcquired = await this.tryAcquireCleanupLock(queryRunner);

      if (!isLockAcquired) {
        this.logger.log(
          'Skipping suspended workspace cleanup because another execution is running',
        );

        return;
      }

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
    } finally {
      try {
        if (isLockAcquired) {
          await this.releaseCleanupLock(queryRunner);
        }
      } finally {
        await queryRunner.release();
      }
    }
  }

  private async tryAcquireCleanupLock(
    queryRunner: QueryRunner,
  ): Promise<boolean> {
    const [result] = (await queryRunner.query(
      `SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS "acquired"`,
      [CLEAN_SUSPENDED_WORKSPACES_LOCK_NAME],
    )) as { acquired: boolean }[];

    return result?.acquired === true;
  }

  private async releaseCleanupLock(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SELECT pg_advisory_unlock(hashtextextended($1, 0))`,
      [CLEAN_SUSPENDED_WORKSPACES_LOCK_NAME],
    );
  }
}
