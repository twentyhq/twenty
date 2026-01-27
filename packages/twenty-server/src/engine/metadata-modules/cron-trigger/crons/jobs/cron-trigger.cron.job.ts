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
  ServerlessFunctionTriggerJob,
  ServerlessFunctionTriggerJobData,
} from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class CronTriggerCronJob {
  constructor(
    @InjectMessageQueue(MessageQueue.serverlessFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
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
      const serverlessFunctionsWithCronTrigger =
        await this.serverlessFunctionRepository.find({
          where: {
            workspaceId: activeWorkspace.id,
            cronTriggerSettings: Not(IsNull()),
          },
          select: ['id', 'cronTriggerSettings', 'workspaceId'],
        });

      for (const serverlessFunction of serverlessFunctionsWithCronTrigger) {
        const cronSettings = serverlessFunction.cronTriggerSettings;

        if (!isDefined(cronSettings?.pattern)) {
          continue;
        }

        if (!shouldRunNow(cronSettings.pattern, now)) {
          continue;
        }

        await this.messageQueueService.add<ServerlessFunctionTriggerJobData[]>(
          ServerlessFunctionTriggerJob.name,
          [
            {
              serverlessFunctionId: serverlessFunction.id,
              workspaceId: serverlessFunction.workspaceId,
              payload: {},
            },
          ],
          { retryLimit: 3 },
        );
      }
    }
  }
}
