import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type ConnectedAccountProvider,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountWebhookSubscriptionEntity,
  type WebhookSubscriptionChannelType,
} from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

type ChannelLocator = {
  channelId: string;
  channelType: WebhookSubscriptionChannelType;
  workspaceId: string;
};

type ResolvedChannel = {
  connectedAccountId: string;
  handle: string;
  provider: ConnectedAccountProvider;
};

@Injectable()
export class WebhookSubscriptionService {
  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly webhookSubscriptionDriverFactory: WebhookSubscriptionDriverFactory,
    private readonly featureFlagService: FeatureFlagService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createSubscription(
    locator: ChannelLocator,
  ): Promise<ConnectedAccountWebhookSubscriptionEntity | undefined> {
    const isWebhookEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MESSAGING_CALENDAR_WEBHOOK_ENABLED,
      locator.workspaceId,
    );

    if (!isWebhookEnabled) {
      return undefined;
    }

    const resolvedChannel = await this.resolveChannel(locator);

    if (
      !isDefined(resolvedChannel) ||
      !this.webhookSubscriptionDriverFactory.isProviderSupported(
        resolvedChannel.provider,
      )
    ) {
      return undefined;
    }

    const existingSubscription =
      await this.webhookSubscriptionRepository.findOne({
        where: {
          connectedAccountId: resolvedChannel.connectedAccountId,
          channelType: locator.channelType,
          workspaceId: locator.workspaceId,
        },
      });

    if (existingSubscription?.status === 'ACTIVE') {
      return existingSubscription;
    }

    const clientState = existingSubscription?.clientState ?? v4();
    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      resolvedChannel.provider,
    );

    const baseSubscription = {
      id: existingSubscription?.id,
      workspaceId: locator.workspaceId,
      connectedAccountId: resolvedChannel.connectedAccountId,
      channelType: locator.channelType,
      messageChannelId:
        locator.channelType === 'messaging' ? locator.channelId : null,
      calendarChannelId:
        locator.channelType === 'calendar' ? locator.channelId : null,
      clientState,
    };

    const driverInput = {
      connectedAccountId: resolvedChannel.connectedAccountId,
      workspaceId: locator.workspaceId,
      handle: resolvedChannel.handle,
      channelId: locator.channelId,
      channelType: locator.channelType,
      clientState,
    };

    if (isDefined(existingSubscription)) {
      await driver
        .deleteSubscription(existingSubscription, driverInput)
        .catch(() => undefined);
    }

    try {
      const result = await driver.createSubscription(driverInput);

      return await this.webhookSubscriptionRepository.save({
        ...baseSubscription,
        externalSubscriptionId: result.externalSubscriptionId,
        externalResourceId: result.externalResourceId,
        status: 'ACTIVE',
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.webhookSubscriptionRepository.save({
        ...baseSubscription,
        status: 'FAILED',
        expiresAt: null,
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: locator.workspaceId },
      });

      return undefined;
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

    const channelId = this.getSubscriptionChannelId(subscription);

    if (!isDefined(connectedAccount) || !isDefined(channelId)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      const result = await driver.renewSubscription(subscription, {
        connectedAccountId: subscription.connectedAccountId,
        workspaceId: subscription.workspaceId,
        handle: connectedAccount.handle,
        channelId,
        channelType: subscription.channelType,
        clientState: subscription.clientState,
      });

      await this.webhookSubscriptionRepository.update(subscription.id, {
        externalSubscriptionId: result.externalSubscriptionId,
        externalResourceId: result.externalResourceId,
        status: 'ACTIVE',
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.webhookSubscriptionRepository.update(subscription.id, {
        status: 'FAILED',
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: subscription.workspaceId },
      });
    }
  }

  async deleteSubscription(locator: ChannelLocator): Promise<void> {
    const subscription = await this.webhookSubscriptionRepository.findOne({
      where:
        locator.channelType === 'messaging'
          ? {
              messageChannelId: locator.channelId,
              workspaceId: locator.workspaceId,
            }
          : {
              calendarChannelId: locator.channelId,
              workspaceId: locator.workspaceId,
            },
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
        await driver.deleteSubscription(subscription, {
          connectedAccountId: subscription.connectedAccountId,
          workspaceId: subscription.workspaceId,
          handle: connectedAccount.handle,
          channelId: locator.channelId,
          channelType: subscription.channelType,
          clientState: subscription.clientState,
        });
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: subscription.workspaceId },
        });
      }
    }

    await this.webhookSubscriptionRepository.delete(subscription.id);
  }

  private getSubscriptionChannelId(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): string | null {
    return subscription.channelType === 'messaging'
      ? subscription.messageChannelId
      : subscription.calendarChannelId;
  }

  private async resolveChannel(
    locator: ChannelLocator,
  ): Promise<ResolvedChannel | undefined> {
    if (locator.channelType === 'messaging') {
      const messageChannel = await this.messageChannelRepository.findOne({
        where: { id: locator.channelId, workspaceId: locator.workspaceId },
        relations: ['connectedAccount'],
      });

      if (!isDefined(messageChannel?.connectedAccount)) {
        return undefined;
      }

      return {
        connectedAccountId: messageChannel.connectedAccountId,
        handle: messageChannel.connectedAccount.handle,
        provider: messageChannel.connectedAccount.provider,
      };
    }

    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: { id: locator.channelId, workspaceId: locator.workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(calendarChannel?.connectedAccount)) {
      return undefined;
    }

    return {
      connectedAccountId: calendarChannel.connectedAccountId,
      handle: calendarChannel.connectedAccount.handle,
      provider: calendarChannel.connectedAccount.provider,
    };
  }
}
