import { RECORD_CAMPAIGN_ENGAGEMENT_JOB } from 'src/engine/core-modules/emailing-domain/constants/record-campaign-engagement-job.constant';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CampaignEngagementRecordingService } from 'src/modules/emailing/services/campaign-engagement-recording.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';

@Processor(MessageQueue.campaignEngagementQueue)
export class RecordCampaignEngagementJob {
  constructor(
    private readonly campaignEngagementRecordingService: CampaignEngagementRecordingService,
  ) {}

  @Process(RECORD_CAMPAIGN_ENGAGEMENT_JOB)
  async handle(observation: CampaignEngagementObservation): Promise<void> {
    await this.campaignEngagementRecordingService.record(observation);
  }
}
