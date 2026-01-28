import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Not, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  LogicFunctionTriggerJob,
  LogicFunctionTriggerJobData,
} from 'src/engine/metadata-modules/logic-function/jobs/logic-function-trigger.job';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class CronTriggerCronJob {
  constructor(
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
  ) {}

  @Process(CronTriggerCronJob.name)
  @SentryCronMonitor(CronTriggerCronJob.name, CRON_TRIGGER_CRON_PATTERN)
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
    });

    const now = new Date();

    for (const activeWorkspace of activeWorkspaces) {
      const logicFunctionsWithCronTrigger =
        await this.logicFunctionRepository.find({
          where: {
            workspaceId: activeWorkspace.id,
            cronTriggerSettings: Not(IsNull()),
          },
          select: ['id', 'cronTriggerSettings', 'workspaceId'],
        });

      for (const logicFunction of logicFunctionsWithCronTrigger) {
        const cronSettings = logicFunction.cronTriggerSettings;

        if (!isDefined(cronSettings?.pattern)) {
          continue;
        }

        if (!shouldRunNow(cronSettings.pattern, now)) {
          continue;
        }

        await this.messageQueueService.add<LogicFunctionTriggerJobData[]>(
          LogicFunctionTriggerJob.name,
          [
            {
              logicFunctionId: logicFunction.id,
              workspaceId: logicFunction.workspaceId,
              payload: {},
            },
          ],
          { retryLimit: 3 },
        );
      }
    }
  }
}
