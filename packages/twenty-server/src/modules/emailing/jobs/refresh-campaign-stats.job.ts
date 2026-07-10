import { REFRESH_CAMPAIGN_STATS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type RefreshCampaignStatsJobData } from 'src/engine/core-modules/emailing-domain/types/refresh-campaign-stats-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';

@Processor(MessageQueue.emailQueue)
export class RefreshCampaignStatsJob {
  constructor(
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  @Process(REFRESH_CAMPAIGN_STATS_JOB)
  async handle(data: RefreshCampaignStatsJobData): Promise<void> {
    await this.messageCampaignStatisticsService.refreshCampaignCounts({
      workspaceId: data.workspaceId,
      campaignId: data.campaignId,
    });
  }
}
