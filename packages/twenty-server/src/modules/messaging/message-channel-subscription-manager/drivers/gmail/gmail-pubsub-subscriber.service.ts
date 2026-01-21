import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { Message, PubSub, Subscription } from '@google-cloud/pubsub';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MessageChannelSubscriptionHealthService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-health.service';
import { MessageChannelSubscriptionMappingService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-mapping.service';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

type GmailPubSubNotification = {
  emailAddress: string;
  historyId: number;
};

@Injectable()
export class GmailPubSubSubscriberService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(GmailPubSubSubscriberService.name);
  private subscription: Subscription | null = null;
  private pubsub: PubSub | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly mappingService: MessageChannelSubscriptionMappingService,
    private readonly healthService: MessageChannelSubscriptionHealthService,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.shouldStart()) {
      this.logger.log(
        'Gmail Pub/Sub subscriber disabled (MESSAGING_GMAIL_PUBSUB_ENABLED=false or missing config)',
      );

      return;
    }

    await this.startSubscriber();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stopSubscriber();
  }

  private shouldStart(): boolean {
    const isEnabled = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_ENABLED',
    );
    const projectId = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_PROJECT_ID',
    );
    const subscriptionName = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_SUBSCRIPTION_NAME',
    );
    const serviceAccountKey = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_SERVICE_ACCOUNT_KEY',
    );

    return Boolean(
      isEnabled && projectId && subscriptionName && serviceAccountKey,
    );
  }

  private async startSubscriber(): Promise<void> {
    try {
      const projectId = this.twentyConfigService.get(
        'MESSAGING_GMAIL_PUBSUB_PROJECT_ID',
      );
      const subscriptionName = this.twentyConfigService.get(
        'MESSAGING_GMAIL_PUBSUB_SUBSCRIPTION_NAME',
      );
      const serviceAccountKeyBase64 = this.twentyConfigService.get(
        'MESSAGING_GMAIL_PUBSUB_SERVICE_ACCOUNT_KEY',
      );

      const credentials = JSON.parse(
        Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8'),
      );

      this.pubsub = new PubSub({
        projectId,
        credentials,
      });

      this.subscription = this.pubsub.subscription(subscriptionName);

      this.subscription.on('message', this.handleMessage.bind(this));
      this.subscription.on('error', this.handleError.bind(this));

      this.healthService.setSubscriberRunning(true);
      this.logger.log(
        `Gmail Pub/Sub subscriber started (subscription: ${subscriptionName})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to start Gmail Pub/Sub subscriber: ${error.message}`,
      );
      this.healthService.setSubscriberRunning(false);
      throw error;
    }
  }

  private async stopSubscriber(): Promise<void> {
    if (this.subscription) {
      this.subscription.removeAllListeners();
      await this.subscription.close();
      this.subscription = null;
    }

    if (this.pubsub) {
      await this.pubsub.close();
      this.pubsub = null;
    }

    this.healthService.setSubscriberRunning(false);
    this.logger.log('Gmail Pub/Sub subscriber stopped');
  }

  private async handleMessage(message: Message): Promise<void> {
    try {
      const data: GmailPubSubNotification = JSON.parse(
        message.data.toString('utf-8'),
      );

      this.logger.debug(
        `Received Pub/Sub notification for ${data.emailAddress} (historyId: ${data.historyId})`,
      );

      this.healthService.recordMessageReceived();

      const mappings = await this.mappingService.getMappings(data.emailAddress);

      if (mappings.length === 0) {
        this.logger.warn(
          `No mapping found for email ${data.emailAddress}, acknowledging message`,
        );
        message.ack();

        return;
      }

      for (const mapping of mappings) {
        this.logger.log(
          `Triggering message list fetch for workspace ${mapping.workspaceId}, channel ${mapping.messageChannelId}`,
        );

        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId: mapping.workspaceId,
            messageChannelId: mapping.messageChannelId,
          },
        );
      }

      message.ack();
    } catch (error) {
      this.logger.error(`Error handling Pub/Sub message: ${error.message}`);
      this.healthService.recordError(error);

      message.nack();
    }
  }

  private handleError(error: Error): void {
    this.logger.error(`Pub/Sub subscriber error: ${error.message}`);
    this.healthService.recordError(error);
  }
}
