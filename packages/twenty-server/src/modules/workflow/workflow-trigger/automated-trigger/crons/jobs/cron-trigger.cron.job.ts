import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Not, Repository } from 'typeorm';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import {
  WorkflowTriggerJob,
  WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

export const CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class CronTriggerCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(CronTriggerCronJob.name)
  @SentryCronMonitor(CronTriggerCronJob.name, CRON_TRIGGER_CRON_PATTERN)
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      const workflowAutomatedTriggerRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
          activeWorkspace.id,
          'workflowAutomatedTrigger',
        );

      const workflowAutomatedCronTriggers =
        await workflowAutomatedTriggerRepository.find({
          where: { cronPattern: Not(IsNull()) },
        });

      for (const workflowAutomatedCronTrigger of workflowAutomatedCronTriggers) {
        await this.messageQueueService.add<WorkflowTriggerJobData>(
          WorkflowTriggerJob.name,
          {
            workspaceId: activeWorkspace.id,
            workflowId: workflowAutomatedCronTrigger.workflowId,
            payload: {},
          },
          { retryLimit: 3 },
        );
      }
    }
  }
}
