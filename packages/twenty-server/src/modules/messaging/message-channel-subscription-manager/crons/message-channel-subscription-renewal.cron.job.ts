import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { LessThan, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  MessageChannelSubscriptionStatus,
  MessageChannelSubscriptionWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel-subscription.workspace-entity';
import {
  MessageChannelSubscriptionRenewalJob,
  MessageChannelSubscriptionRenewalJobData,
} from 'src/modules/messaging/message-channel-subscription-manager/jobs/message-channel-subscription-renewal.job';

export const MESSAGE_CHANNEL_SUBSCRIPTION_RENEWAL_CRON_PATTERN = '0 3 * * *';

const DAYS_UNTIL_EXPIRATION_THRESHOLD = 2;

@Processor(MessageQueue.cronQueue)
export class MessageChannelSubscriptionRenewalCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessageChannelSubscriptionRenewalCronJob.name)
  @SentryCronMonitor(
    MessageChannelSubscriptionRenewalCronJob.name,
    MESSAGE_CHANNEL_SUBSCRIPTION_RENEWAL_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    if (!this.twentyConfigService.get('MESSAGING_GMAIL_PUBSUB_ENABLED')) {
      return;
    }

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const expirationThreshold = new Date();

    expirationThreshold.setDate(
      expirationThreshold.getDate() + DAYS_UNTIL_EXPIRATION_THRESHOLD,
    );

    for (const workspace of activeWorkspaces) {
      try {
        const subscriptionRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
            workspace.id,
            'messageChannelSubscription',
          );

        const expiringSubscriptions = await subscriptionRepository.find({
          where: {
            status: MessageChannelSubscriptionStatus.ACTIVE,
            expiresAt: LessThan(expirationThreshold.toISOString()),
          },
        });

        const expiredSubscriptions = await subscriptionRepository.find({
          where: {
            status: MessageChannelSubscriptionStatus.EXPIRED,
          },
        });

        const subscriptionsToRenew = [
          ...expiringSubscriptions,
          ...expiredSubscriptions,
        ];

        for (const subscription of subscriptionsToRenew) {
          await this.messageQueueService.add<MessageChannelSubscriptionRenewalJobData>(
            MessageChannelSubscriptionRenewalJob.name,
            {
              workspaceId: workspace.id,
              subscriptionId: subscription.id,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspace.id,
          },
        });
      }
    }
  }
}
