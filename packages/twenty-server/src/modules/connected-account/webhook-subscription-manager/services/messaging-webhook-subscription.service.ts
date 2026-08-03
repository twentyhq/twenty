import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';
import { type WebhookSubscriptionContext } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

@Injectable()
export class MessagingWebhookSubscriptionService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly webhookSubscriptionDriverFactory: WebhookSubscriptionDriverFactory,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(messageChannel?.connectedAccount)) {
      return;
    }

    const { connectedAccount } = messageChannel;

    if (
      !this.webhookSubscriptionDriverFactory.isProviderSupported(
        connectedAccount.provider,
      )
    ) {
      return;
    }

    if (
      messageChannel.webhookSubscriptionStatus ===
      WebhookSubscriptionStatus.ACTIVE
    ) {
      return;
    }

    const clientState = messageChannel.webhookSubscriptionClientState ?? v4();
    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    // Keep any existing watch live until the replacement is created, then stop it.
    const previousSubscription = isDefined(
      messageChannel.webhookSubscriptionExternalId,
    )
      ? this.toContext(messageChannel)
      : null;

    try {
      const result = await driver.createSubscription(
        messageChannel.connectedAccountId,
        WebhookSubscriptionChannelType.MESSAGING,
        clientState,
      );

      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
        webhookSubscriptionFailureCount: 0,
      });
    } catch (error) {
      await this.recordSubscriptionFailure({
        messageChannel,
        error,
        workspaceId,
        additionalUpdate: {
          webhookSubscriptionClientState: clientState,
          webhookSubscriptionExpiresAt: null,
        },
      });

      return;
    }

    if (isDefined(previousSubscription)) {
      await driver
        .deleteSubscription(previousSubscription)
        .catch(() => undefined);
    }
  }

  async renewSubscription({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(messageChannel)) {
      return;
    }

    if (
      messageChannel.webhookSubscriptionStatus !==
      WebhookSubscriptionStatus.ACTIVE
    ) {
      await this.createSubscription(messageChannelId, workspaceId);

      return;
    }

    const { connectedAccount } = messageChannel;

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      const result = await driver.renewSubscription(
        this.toContext(messageChannel),
      );

      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
        webhookSubscriptionFailureCount: 0,
      });
    } catch (error) {
      await this.recordSubscriptionFailure({
        messageChannel,
        error,
        workspaceId: messageChannel.workspaceId,
      });

      return;
    }
  }

  // Bounded-retry accounting shared by create and renew failures: increment the
  // per-channel counter, keep the channel FAILED, and only report to Sentry when
  // the retry budget is spent. The renewal cron stops re-enqueuing the channel
  // once the counter reaches WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS, which is
  // what breaks the previous infinite hourly retry loop.
  private async recordSubscriptionFailure({
    messageChannel,
    error,
    workspaceId,
    additionalUpdate = {},
  }: {
    messageChannel: Pick<
      MessageChannelEntity,
      'id' | 'webhookSubscriptionFailureCount'
    >;
    error: unknown;
    workspaceId: string;
    additionalUpdate?: QueryDeepPartialEntity<MessageChannelEntity>;
  }): Promise<void> {
    const failureCount = messageChannel.webhookSubscriptionFailureCount + 1;

    await this.messageChannelRepository.update(messageChannel.id, {
      ...additionalUpdate,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
      webhookSubscriptionFailureCount: failureCount,
    });

    if (failureCount < WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS) {
      return;
    }

    this.exceptionHandlerService.captureExceptions([error], {
      additionalData: {
        messageChannelId: messageChannel.id,
        webhookSubscriptionFailureCount: failureCount,
      },
      workspace: { id: workspaceId },
    });
  }

  async deleteSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
    });

    if (!isDefined(messageChannel)) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: messageChannel.connectedAccountId,
        workspaceId: messageChannel.workspaceId,
      },
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      await driver.deleteSubscription(this.toContext(messageChannel));
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: messageChannel.workspaceId },
      });
    }
  }

  private toContext(
    messageChannel: MessageChannelEntity,
  ): WebhookSubscriptionContext {
    return {
      connectedAccountId: messageChannel.connectedAccountId,
      channelType: WebhookSubscriptionChannelType.MESSAGING,
      externalSubscriptionId: messageChannel.webhookSubscriptionExternalId,
      externalResourceId: null,
      clientState: messageChannel.webhookSubscriptionClientState ?? '',
    };
  }
}
