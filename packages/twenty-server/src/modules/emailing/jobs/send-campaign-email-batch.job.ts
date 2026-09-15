import { SEND_CAMPAIGN_EMAIL_BATCH_JOB } from 'src/engine/core-modules/emailing-domain/constants/send-campaign-email-batch-job.constant';
import { type SendCampaignEmailBatchJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-batch-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignBatchDeliveryService } from 'src/modules/emailing/services/message-campaign-batch-delivery.service';

@Processor(MessageQueue.campaignSendQueue)
export class SendCampaignEmailBatchJob {
  constructor(
    private readonly messageCampaignBatchDeliveryService: MessageCampaignBatchDeliveryService,
  ) {}

  @Process(SEND_CAMPAIGN_EMAIL_BATCH_JOB)
  async handle(data: SendCampaignEmailBatchJobData): Promise<void> {
    await this.messageCampaignBatchDeliveryService.processSendBatchJob(data);
  }
}
