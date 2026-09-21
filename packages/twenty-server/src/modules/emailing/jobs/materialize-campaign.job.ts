import { MATERIALIZE_CAMPAIGN_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignMaterializationService } from 'src/modules/emailing/services/message-campaign-materialization.service';

@Processor(MessageQueue.campaignQueue)
export class MaterializeCampaignJob {
  constructor(
    private readonly messageCampaignMaterializationService: MessageCampaignMaterializationService,
  ) {}

  @Process(MATERIALIZE_CAMPAIGN_JOB)
  async handle(data: MaterializeCampaignJobData): Promise<void> {
    await this.messageCampaignMaterializationService.processMaterializeJob(
      data,
    );
  }
}
