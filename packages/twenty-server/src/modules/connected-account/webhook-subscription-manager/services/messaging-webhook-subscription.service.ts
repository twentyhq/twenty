import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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
    private readonly metricsService: MetricsService,
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
      });

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionCreated,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });
    } catch (error) {
      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionExpiresAt: null,
      });

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionCreationFailed,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });

      throw error;
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
      });

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionRenewed,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });
    } catch (error) {
      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
      });

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionRenewalFailed,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: messageChannel.workspaceId },
      });

      throw error;
    }
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

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionDeleted,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.ConnectedAccountWebhookSubscriptionDeletionFailed,
        amount: 1,
        attributes: this.buildMetricAttributes(connectedAccount.provider),
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: messageChannel.workspaceId },
      });
    }
  }

  private buildMetricAttributes(provider: string) {
    return {
      channel_type: WebhookSubscriptionChannelType.MESSAGING,
      provider,
    };
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
