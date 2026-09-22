import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WORKSPACE_DESTROY_JOB_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/workspace-destroy-job-duration-ms-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type DestroySoftDeletedWorkspaceJobData = {
  workspaceId: string;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class DestroySoftDeletedWorkspaceJob {
  private readonly logger = new Logger(DestroySoftDeletedWorkspaceJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceService: WorkspaceService,
    private readonly metricsService: MetricsService,
  ) {}

  @Process(DestroySoftDeletedWorkspaceJob.name)
  async handle({
    workspaceId,
  }: DestroySoftDeletedWorkspaceJobData): Promise<void> {
    const isWorkspaceStillPresent = await this.workspaceRepository.exists({
      where: { id: workspaceId },
      withDeleted: true,
    });

    if (!isWorkspaceStillPresent) {
      this.logger.log(`Workspace ${workspaceId} is already destroyed`);

      return;
    }

    this.logger.log(`Destroying workspace ${workspaceId}`);

    const destructionStart = performance.now();

    try {
      await this.workspaceService.deleteWorkspace(workspaceId);
    } catch (error) {
      this.recordDurationMetric({
        status: 'fail',
        durationMs: performance.now() - destructionStart,
      });

      throw error;
    }

    this.recordDurationMetric({
      status: 'success',
      durationMs: performance.now() - destructionStart,
    });

    void this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.CronJobDeletedWorkspace,
      shouldStoreInCache: false,
    });
  }

  private recordDurationMetric({
    status,
    durationMs,
  }: {
    status: 'success' | 'fail';
    durationMs: number;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.WorkspaceDestroyJobDurationMs,
      value: durationMs,
      unit: 'ms',
      attributes: { status },
      bucketBoundaries: WORKSPACE_DESTROY_JOB_DURATION_MS_BUCKET_BOUNDARIES,
    });
  }
}
