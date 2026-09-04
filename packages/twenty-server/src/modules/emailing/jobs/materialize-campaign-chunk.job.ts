import { MATERIALIZE_CAMPAIGN_CHUNK_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type MaterializeCampaignChunkJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-chunk-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignMaterializationService } from 'src/modules/emailing/services/message-campaign-materialization.service';

@Processor(MessageQueue.campaignQueue)
export class MaterializeCampaignChunkJob {
  constructor(
    private readonly messageCampaignMaterializationService: MessageCampaignMaterializationService,
  ) {}

  @Process(MATERIALIZE_CAMPAIGN_CHUNK_JOB)
  async handle(data: MaterializeCampaignChunkJobData): Promise<void> {
    await this.messageCampaignMaterializationService.processMaterializeChunkJob(
      data,
    );
  }
}
