import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { WebhookSubscriptionStatus } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-status.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

@Injectable()
export class MessagingWebhookSubscriptionService {
  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly webhookSubscriptionDriverFactory: WebhookSubscriptionDriverFactory,
    private readonly featureFlagService: FeatureFlagService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<ConnectedAccountWebhookSubscriptionEntity | undefined> {
    const isWebhookEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MESSAGING_CALENDAR_WEBHOOK_ENABLED,
      workspaceId,
    );

    if (!isWebhookEnabled) {
      return;
    }

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

    const existingSubscription =
      await this.webhookSubscriptionRepository.findOne({
        where: {
          connectedAccountId: messageChannel.connectedAccountId,
          channelType: WebhookSubscriptionChannelType.MESSAGING,
          workspaceId,
        },
      });

    if (existingSubscription?.status === WebhookSubscriptionStatus.ACTIVE) {
      return existingSubscription;
    }

    const clientState = existingSubscription?.clientState ?? v4();
    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    const subscriptionToSave: Partial<ConnectedAccountWebhookSubscriptionEntity> =
      {
        id: existingSubscription?.id,
        workspaceId,
        connectedAccountId: messageChannel.connectedAccountId,
        channelType: WebhookSubscriptionChannelType.MESSAGING,
        messageChannelId,
        calendarChannelId: null,
        clientState,
      };

    if (isDefined(existingSubscription)) {
      await driver
        .deleteSubscription(existingSubscription)
        .catch(() => undefined);
    }

    try {
      const result = await driver.createSubscription(
        messageChannel.connectedAccountId,
        WebhookSubscriptionChannelType.MESSAGING,
        clientState,
      );

      return await this.webhookSubscriptionRepository.save({
        ...subscriptionToSave,
        externalSubscriptionId: result.externalSubscriptionId,
        externalResourceId: result.externalResourceId,
        status: WebhookSubscriptionStatus.ACTIVE,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.webhookSubscriptionRepository.save({
        ...subscriptionToSave,
        status: WebhookSubscriptionStatus.FAILED,
        expiresAt: null,
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });

      return;
    }
  }

  async renewSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: subscription.connectedAccountId,
        workspaceId: subscription.workspaceId,
      },
    });

    if (
      !isDefined(connectedAccount) ||
      !isDefined(subscription.messageChannelId)
    ) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      const result = await driver.renewSubscription(subscription);

      await this.webhookSubscriptionRepository.update(subscription.id, {
        externalSubscriptionId: result.externalSubscriptionId,
        externalResourceId: result.externalResourceId,
        status: WebhookSubscriptionStatus.ACTIVE,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.webhookSubscriptionRepository.update(subscription.id, {
        status: WebhookSubscriptionStatus.FAILED,
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: subscription.workspaceId },
      });
    }
  }

  async deleteSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const subscription = await this.webhookSubscriptionRepository.findOne({
      where: { messageChannelId, workspaceId },
    });

    if (!isDefined(subscription)) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: subscription.connectedAccountId,
        workspaceId: subscription.workspaceId,
      },
    });

    if (isDefined(connectedAccount)) {
      const driver = this.webhookSubscriptionDriverFactory.getDriver(
        connectedAccount.provider,
      );

      try {
        await driver.deleteSubscription(subscription);
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: subscription.workspaceId },
        });
      }
    }

    await this.webhookSubscriptionRepository.delete(subscription.id);
  }
}
