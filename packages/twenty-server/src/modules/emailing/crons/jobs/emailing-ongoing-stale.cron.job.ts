import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessageCampaignRecoveryService } from 'src/modules/emailing/services/message-campaign-recovery.service';

export const EMAILING_ONGOING_STALE_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class EmailingOngoingStaleCronJob {
  private readonly logger = new Logger(EmailingOngoingStaleCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly messageCampaignRecoveryService: MessageCampaignRecoveryService,
  ) {}

  @Process(EmailingOngoingStaleCronJob.name)
  @SentryCronMonitor(
    EmailingOngoingStaleCronJob.name,
    EMAILING_ONGOING_STALE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
      select: ['id'],
    });

    for (const workspace of workspaces) {
      await this.messageCampaignRecoveryService
        .recoverOngoingStaleCampaigns({ workspaceId: workspace.id })
        .catch((error) => {
          this.logger.error(
            `[${EmailingOngoingStaleCronJob.name}] Cannot recover ongoing stale campaigns of workspace ${workspace.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });
    }
  }
}
