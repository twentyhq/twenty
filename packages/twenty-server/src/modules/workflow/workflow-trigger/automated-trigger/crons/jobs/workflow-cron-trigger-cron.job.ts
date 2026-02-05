import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type CronTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const WORKFLOW_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowCronTriggerCronJob {
  private readonly logger = new Logger(WorkflowCronTriggerCronJob.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowCronTriggerCronJob.name)
  @SentryCronMonitor(
    WorkflowCronTriggerCronJob.name,
    WORKFLOW_CRON_TRIGGER_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('WorkflowCronTriggerCronJob started');

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    this.logger.log(`Found ${activeWorkspaces.length} active workspaces`);

    const now = new Date();

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const workflowAutomatedCronTriggers = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."workflowAutomatedTrigger" WHERE type = '${AutomatedTriggerType.CRON}'`,
        );

        this.logger.log(
          `Workspace ${activeWorkspace.id}: found ${workflowAutomatedCronTriggers.length} cron triggers`,
        );

        for (const workflowAutomatedCronTrigger of workflowAutomatedCronTriggers) {
          const settings =
            workflowAutomatedCronTrigger.settings as CronTriggerSettings;

          this.logger.log(
            `Trigger ${workflowAutomatedCronTrigger.id} for workflow ${workflowAutomatedCronTrigger.workflowId}: pattern=${settings.pattern}`,
          );

          if (!isDefined(settings.pattern)) {
            this.logger.warn(
              `Trigger ${workflowAutomatedCronTrigger.id}: skipping - pattern not defined`,
            );
            continue;
          }

          const shouldRun = shouldRunNow(settings.pattern, now);

          this.logger.log(
            `Trigger ${workflowAutomatedCronTrigger.id}: shouldRunNow(${settings.pattern}, ${now.toISOString()}) = ${shouldRun}`,
          );

          if (!shouldRun) {
            continue;
          }

          this.logger.log(
            `Trigger ${workflowAutomatedCronTrigger.id}: enqueuing WorkflowTriggerJob for workflow ${workflowAutomatedCronTrigger.workflowId}`,
          );

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
        this.logger.error(
          `Error processing workspace ${activeWorkspace.id}: ${error}`,
        );
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }

    this.logger.log('WorkflowCronTriggerCronJob completed');
  }
}
