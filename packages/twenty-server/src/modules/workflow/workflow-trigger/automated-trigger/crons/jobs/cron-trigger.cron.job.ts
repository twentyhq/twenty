import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
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
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
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
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const workflowAutomatedCronTriggers = await mainDataSource.query(
          `SELECT * FROM ${schemaName}."workflowAutomatedTrigger" WHERE type = '${AutomatedTriggerType.CRON}'`,
        );

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
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}
