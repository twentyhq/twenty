import { type SendScheduledCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/send-scheduled-campaign-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEND_SCHEDULED_CAMPAIGN_JOB } from 'src/modules/emailing/constants/send-scheduled-campaign-job.constant';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';

@Processor(MessageQueue.campaignQueue)
export class SendScheduledCampaignJob {
  constructor(
    private readonly messageCampaignScheduleService: MessageCampaignScheduleService,
  ) {}

  @Process(SEND_SCHEDULED_CAMPAIGN_JOB)
  async handle(data: SendScheduledCampaignJobData): Promise<void> {
    await this.messageCampaignScheduleService.sendScheduled(data);
  }
}
