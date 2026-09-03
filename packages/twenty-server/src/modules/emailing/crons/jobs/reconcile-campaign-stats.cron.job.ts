import { RECONCILE_CAMPAIGN_STATS_CRON_PATTERN } from 'src/modules/emailing/constants/reconcile-campaign-stats-cron-pattern.constant';
import { CAMPAIGN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-job-retry-limit.constant';
import { RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type ReconcileWorkspaceCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/reconcile-workspace-campaign-stats-job-data.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const ENQUEUE_BATCH_SIZE = 500;

@Processor(MessageQueue.cronQueue)
export class ReconcileCampaignStatsCronJob {
  constructor(
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(ReconcileCampaignStatsCronJob.name)
  @SentryCronMonitor(
    ReconcileCampaignStatsCronJob.name,
    RECONCILE_CAMPAIGN_STATS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaceIds = await this.findSendingWorkspaceIds();

    for (const workspaceIdsBatch of chunk(workspaceIds, ENQUEUE_BATCH_SIZE)) {
      await this.messageQueueService
        .bulkAdd<ReconcileWorkspaceCampaignStatsJobData>(
          RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB,
          workspaceIdsBatch.map((workspaceId) => ({ data: { workspaceId } })),
          { retryLimit: CAMPAIGN_JOB_RETRY_LIMIT },
        )
        .catch((error) => {
          this.exceptionHandlerService.captureExceptions([error]);
        });
    }
  }

  private async findSendingWorkspaceIds(): Promise<string[]> {
    const emailingDomains = await this.emailingDomainRepository.find({
      select: { workspaceId: true },
      where: {
        workspace: {
          deletedAt: IsNull(),
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      },
    });

    return [...new Set(emailingDomains.map(({ workspaceId }) => workspaceId))];
  }
}
