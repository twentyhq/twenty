import { RECOVER_WORKSPACE_STALE_CAMPAIGNS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignWorkspaceJobData } from 'src/engine/core-modules/emailing-domain/types/campaign-workspace-job-data.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageCampaignRecoveryService } from 'src/modules/emailing/services/message-campaign-recovery.service';

@Processor(MessageQueue.campaignQueue)
export class RecoverWorkspaceStaleCampaignsJob {
  constructor(
    private readonly messageCampaignRecoveryService: MessageCampaignRecoveryService,
  ) {}

  @Process(RECOVER_WORKSPACE_STALE_CAMPAIGNS_JOB)
  async handle(data: CampaignWorkspaceJobData): Promise<void> {
    await this.messageCampaignRecoveryService.recoverOngoingStaleCampaigns({
      workspaceId: data.workspaceId,
    });
  }
}
