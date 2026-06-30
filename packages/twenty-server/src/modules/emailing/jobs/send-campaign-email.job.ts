import { SEND_CAMPAIGN_EMAIL_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.emailQueue)
export class SendCampaignEmailJob {
  constructor(
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  @Process(SEND_CAMPAIGN_EMAIL_JOB)
  async handle(data: SendCampaignEmailJobData): Promise<void> {
    await this.messageCampaignService.processSendJob(data);
  }
}
