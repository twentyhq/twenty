import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { cleanSuspendedWorkspaceCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.cron.pattern';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Processor(MessageQueue.cronQueue)
export class CleanSuspendedWorkspacesJob {
  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  @SentryCronMonitor(
    CleanSuspendedWorkspacesJob.name,
    cleanSuspendedWorkspaceCronPattern,
  )
  async handle(): Promise<void> {
    const suspendedWorkspaceIds = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
      withDeleted: true,
    });

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
      suspendedWorkspaceIds.map((workspace) => workspace.id),
    );
  }
}
