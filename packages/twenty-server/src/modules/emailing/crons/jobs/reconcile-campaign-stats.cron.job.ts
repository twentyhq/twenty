import { RECONCILE_CAMPAIGN_STATS_CRON_PATTERN } from 'src/modules/emailing/constants/reconcile-campaign-stats-cron-pattern.constant';
import { RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CampaignSendingWorkspaceService } from 'src/modules/emailing/services/campaign-sending-workspace.service';

@Processor(MessageQueue.cronQueue)
export class ReconcileCampaignStatsCronJob {
  constructor(
    private readonly campaignSendingWorkspaceService: CampaignSendingWorkspaceService,
  ) {}

  @Process(ReconcileCampaignStatsCronJob.name)
  @SentryCronMonitor(
    ReconcileCampaignStatsCronJob.name,
    RECONCILE_CAMPAIGN_STATS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.campaignSendingWorkspaceService.enqueueJobForEachSendingWorkspace(
      RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB,
    );
  }
}
