import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
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
    private readonly workspaceService: WorkspaceService,
    private readonly applicationUninstallService: ApplicationUninstallService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  @SentryCronMonitor(
    CleanSuspendedWorkspacesJob.name,
    cleanSuspendedWorkspaceCronPattern,
  )
  async handle(): Promise<void> {
    const advisoryLockResult =
      await this.postgresAdvisoryLockService.tryWithLock(
        CLEAN_SUSPENDED_WORKSPACES_LOCK_NAME,
        async () => {
          const suspendedWorkspaces = await this.workspaceRepository.find({
            select: ['id'],
            where: {
              activationStatus: WorkspaceActivationStatus.SUSPENDED,
            },
            withDeleted: true,
          });
          const softDeletedWorkspaces = await this.workspaceRepository.find({
            select: ['id', 'deletedAt'],
            where: { deletedAt: Not(IsNull()) },
            withDeleted: true,
          });

          const workspaceDeletionUninstallRequests =
            softDeletedWorkspaces.flatMap((workspace) =>
              isDefined(workspace.deletedAt)
                ? [
                    {
                      workspaceId: workspace.id,
                      uninstallRequestedAt: workspace.deletedAt,
                    },
                  ]
                : [],
            );
          const workspaceIdsWithPendingUninstallHooks =
            await this.applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks(
              workspaceDeletionUninstallRequests,
            );

          for (const request of workspaceDeletionUninstallRequests) {
            if (
              workspaceIdsWithPendingUninstallHooks.has(request.workspaceId)
            ) {
              await this.workspaceService.enqueueWorkspaceDeletionApplicationUninstall(
                request.workspaceId,
              );
            }
          }

          await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
            {
              workspaceIds: suspendedWorkspaces.map(
                (workspace) => workspace.id,
              ),
            },
          );
        },
      );

    if (!advisoryLockResult.acquired) {
      this.logger.log(
        'Skipping suspended workspace cleanup because another execution is running',
      );
    }
  }
}
