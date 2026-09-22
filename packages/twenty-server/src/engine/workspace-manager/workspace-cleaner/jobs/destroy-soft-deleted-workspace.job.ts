import { Injectable, Logger } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

export type DestroySoftDeletedWorkspaceJobData = {
  workspaceId: string;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class DestroySoftDeletedWorkspaceJob {
  private readonly logger = new Logger(DestroySoftDeletedWorkspaceJob.name);

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly metricsService: MetricsService,
  ) {}

  @Process(DestroySoftDeletedWorkspaceJob.name)
  async handle({
    workspaceId,
  }: DestroySoftDeletedWorkspaceJobData): Promise<void> {
    this.logger.log(`Destroying workspace ${workspaceId}`);

    await this.workspaceService.deleteWorkspace(workspaceId);

    void this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.CronJobDeletedWorkspace,
      shouldStoreInCache: false,
    });
  }
}
