import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ArtificialAnalysisSyncCronJob } from 'src/engine/metadata-modules/ai/ai-models/crons/artificial-analysis-sync.cron.job';
import { ARTIFICIAL_ANALYSIS_SYNC_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-models/crons/constants/artificial-analysis-sync-cron-pattern.constant';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

@Command({
  name: 'cron:artificial-analysis-sync',
  description:
    'Register background refreshes of the shared AI benchmark catalog',
})
export class ArtificialAnalysisSyncCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly artificialAnalysisCatalogService: ArtificialAnalysisCatalogService,
  ) {
    super();
  }

  async run(): Promise<void> {
    if (!this.artificialAnalysisCatalogService.isSyncEnabled()) {
      await this.messageQueueService.removeCron({
        jobName: ArtificialAnalysisSyncCronJob.name,
      });

      return;
    }

    await this.messageQueueService.addCron<undefined>({
      jobName: ArtificialAnalysisSyncCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: ARTIFICIAL_ANALYSIS_SYNC_CRON_PATTERN },
      },
    });
    await this.messageQueueService.add(ArtificialAnalysisSyncCronJob.name, {});
  }
}
