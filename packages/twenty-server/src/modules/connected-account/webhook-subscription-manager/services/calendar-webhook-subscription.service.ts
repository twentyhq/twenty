import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { WebhookSubscriptionStatus } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-status.enum';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

@Injectable()
export class CalendarWebhookSubscriptionService {
  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly webhookSubscriptionDriverFactory: WebhookSubscriptionDriverFactory,
    private readonly featureFlagService: FeatureFlagService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createSubscription(
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<ConnectedAccountWebhookSubscriptionEntity | undefined> {
    const isWebhookEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MESSAGING_CALENDAR_WEBHOOK_ENABLED,
      workspaceId,
    );

    if (!isWebhookEnabled) {
      return;
    }

    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: { id: calendarChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(calendarChannel?.connectedAccount)) {
      return;
    }

    const { connectedAccount } = calendarChannel;

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
          connectedAccountId: calendarChannel.connectedAccountId,
          channelType: WebhookSubscriptionChannelType.CALENDAR,
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
        connectedAccountId: calendarChannel.connectedAccountId,
        channelType: WebhookSubscriptionChannelType.CALENDAR,
        messageChannelId: null,
        calendarChannelId,
        clientState,
      };

    if (isDefined(existingSubscription)) {
      await driver
        .deleteSubscription(existingSubscription)
        .catch(() => undefined);
    }

    try {
      const result = await driver.createSubscription(
        calendarChannel.connectedAccountId,
        WebhookSubscriptionChannelType.CALENDAR,
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
      !isDefined(subscription.calendarChannelId)
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
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const subscription = await this.webhookSubscriptionRepository.findOne({
      where: { calendarChannelId, workspaceId },
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
