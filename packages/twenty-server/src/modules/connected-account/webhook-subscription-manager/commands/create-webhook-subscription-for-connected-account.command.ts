import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  ConnectedAccountProvider,
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  CreateWebhookSubscriptionJob,
  type CreateWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/create-webhook-subscription.job';

const WEBHOOK_BACKFILL_SPACING_MS = 2000;
const WEBHOOK_BACKFILL_RETRY_LIMIT = 3;

const WEBHOOK_CAPABLE_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
];

@Command({
  name: 'connected-account:create-webhook-subscription',
  description:
    'Enqueue webhook subscription creation for existing Google/Microsoft channels still on polling, staggered to avoid provider rate limiting',
})
export class CreateWebhookSubscriptionForConnectedAccountCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private enqueueCursorMs = 0;

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const messageChannelIds = await this.findEligibleChannelIds(
      this.messageChannelRepository,
      workspaceId,
    );

    await this.enqueueChannels(
      WebhookSubscriptionChannelType.MESSAGING,
      messageChannelIds,
      workspaceId,
      isDryRun,
    );

    const calendarChannelIds = await this.findEligibleChannelIds(
      this.calendarChannelRepository,
      workspaceId,
    );

    await this.enqueueChannels(
      WebhookSubscriptionChannelType.CALENDAR,
      calendarChannelIds,
      workspaceId,
      isDryRun,
    );
  }

  private async findEligibleChannelIds<
    TChannel extends MessageChannelEntity | CalendarChannelEntity,
  >(repository: Repository<TChannel>, workspaceId: string): Promise<string[]> {
    const rows = await repository
      .createQueryBuilder('core')
      .select('core.id', 'id')
      .innerJoin('core.connectedAccount', 'connectedAccount')
      .where('core.workspaceId = :workspaceId', { workspaceId })
      .andWhere('core.isSyncEnabled = true')
      .andWhere('connectedAccount.provider IN (:...providers)', {
        providers: WEBHOOK_CAPABLE_PROVIDERS,
      })
      .andWhere(
        '(core.webhookSubscriptionStatus IS NULL OR core.webhookSubscriptionStatus != :activeStatus)',
        { activeStatus: WebhookSubscriptionStatus.ACTIVE },
      )
      .getRawMany<{ id: string }>();

    return rows.map((row) => row.id);
  }

  private async enqueueChannels(
    channelType: WebhookSubscriptionChannelType,
    channelIds: string[],
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    if (channelIds.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${channelIds.length} ${channelType} channels eligible for webhook backfill`,
      );

      return;
    }

    for (const channelId of channelIds) {
      await this.webhookQueueService.add<CreateWebhookSubscriptionJobData>(
        CreateWebhookSubscriptionJob.name,
        { channelType, channelId, workspaceId },
        {
          delay: this.enqueueCursorMs,
          retryLimit: WEBHOOK_BACKFILL_RETRY_LIMIT,
        },
      );

      this.enqueueCursorMs += WEBHOOK_BACKFILL_SPACING_MS;
    }

    this.logger.log(
      `Workspace ${workspaceId}: enqueued ${channelIds.length} ${channelType} webhook backfill jobs`,
    );
  }
}
