import { SEND_CAMPAIGN_EMAIL_BATCH_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type SendCampaignEmailBatchJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-batch-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

@Processor(MessageQueue.emailQueue)
export class SendCampaignEmailBatchJob {
  constructor(
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  @Process(SEND_CAMPAIGN_EMAIL_BATCH_JOB)
  async handle(data: SendCampaignEmailBatchJobData): Promise<void> {
    await this.messageCampaignService.processSendBatchJob(data);
  }
}
