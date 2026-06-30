import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, LessThan, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { cleanOnboardingWorkspacesCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.cron.pattern';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Processor(MessageQueue.cronQueue)
export class CleanOnboardingWorkspacesJob {
  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  @Process(CleanOnboardingWorkspacesJob.name)
  @SentryCronMonitor(
    CleanOnboardingWorkspacesJob.name,
    cleanOnboardingWorkspacesCronPattern,
  )
  async handle(): Promise<void> {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const onboardingWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.PENDING_CREATION,
          WorkspaceActivationStatus.ONGOING_CREATION,
        ]),
        createdAt: LessThan(sevenDaysAgo),
      },
      withDeleted: true,
    });

    await this.cleanerWorkspaceService.batchCleanOnboardingWorkspaces(
      onboardingWorkspaces.map((workspace) => workspace.id),
    );
  }
}
