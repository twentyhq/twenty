import { RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignWorkspaceJobData } from 'src/engine/core-modules/emailing-domain/types/campaign-workspace-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';

@Processor(MessageQueue.campaignQueue)
export class ReconcileWorkspaceCampaignStatsJob {
  constructor(
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  @Process(RECONCILE_WORKSPACE_CAMPAIGN_STATS_JOB)
  async handle(data: CampaignWorkspaceJobData): Promise<void> {
    await this.messageCampaignStatisticsService.reconcileWorkspaceCampaignCounts(
      { workspaceId: data.workspaceId },
    );
  }
}
