import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  AutomatedTriggerType,
  WorkflowAutomatedTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { CronTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { shouldRunNow } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/should-run-now.utils';
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

    const now = new Date();

    for (const activeWorkspace of activeWorkspaces) {
      const workflowAutomatedTriggerRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
          activeWorkspace.id,
          'workflowAutomatedTrigger',
        );

      const workflowAutomatedCronTriggers =
        await workflowAutomatedTriggerRepository.find({
          where: { type: AutomatedTriggerType.CRON },
        });

      for (const workflowAutomatedCronTrigger of workflowAutomatedCronTriggers) {
        const settings =
          workflowAutomatedCronTrigger.settings as CronTriggerSettings;

        if (!isDefined(settings.pattern)) {
          continue;
        }

        if (!shouldRunNow(settings.pattern, now)) {
          continue;
        }

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
