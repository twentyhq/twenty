import { EMAILING_ONGOING_STALE_CRON_PATTERN } from 'src/modules/emailing/constants/emailing-ongoing-stale-cron-pattern.constant';
import { RECOVER_WORKSPACE_STALE_CAMPAIGNS_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CampaignSendingWorkspaceService } from 'src/modules/emailing/services/campaign-sending-workspace.service';

@Processor(MessageQueue.cronQueue)
export class EmailingOngoingStaleCronJob {
  constructor(
    private readonly campaignSendingWorkspaceService: CampaignSendingWorkspaceService,
  ) {}

  @Process(EmailingOngoingStaleCronJob.name)
  @SentryCronMonitor(
    EmailingOngoingStaleCronJob.name,
    EMAILING_ONGOING_STALE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.campaignSendingWorkspaceService.enqueueJobForEachSendingWorkspace(
      RECOVER_WORKSPACE_STALE_CAMPAIGNS_JOB,
    );
  }
}
