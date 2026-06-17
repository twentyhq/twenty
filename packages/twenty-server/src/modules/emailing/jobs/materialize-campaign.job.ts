import { MATERIALIZE_CAMPAIGN_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

@Processor(MessageQueue.emailQueue)
export class MaterializeCampaignJob {
  constructor(
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  @Process(MATERIALIZE_CAMPAIGN_JOB)
  async handle(data: MaterializeCampaignJobData): Promise<void> {
    await this.messageCampaignService.processMaterializeJob(data);
  }
}
