import { Injectable } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ARTIFICIAL_ANALYSIS_SYNC_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-models/crons/constants/artificial-analysis-sync-cron-pattern.constant';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class ArtificialAnalysisSyncCronJob {
  constructor(
    private readonly artificialAnalysisCatalogService: ArtificialAnalysisCatalogService,
  ) {}

  @Process(ArtificialAnalysisSyncCronJob.name)
  @SentryCronMonitor(
    ArtificialAnalysisSyncCronJob.name,
    ARTIFICIAL_ANALYSIS_SYNC_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.artificialAnalysisCatalogService.refreshCatalog();
  }
}
