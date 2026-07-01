import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  FeatureFlagKey,
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';
import { type WebhookSubscriptionContext } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

@Injectable()
export class CalendarWebhookSubscriptionService {
  constructor(
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
  ): Promise<void> {
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

    if (
      calendarChannel.webhookSubscriptionStatus ===
      WebhookSubscriptionStatus.ACTIVE
    ) {
      return;
    }

    const clientState = calendarChannel.webhookSubscriptionClientState ?? v4();
    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    if (isDefined(calendarChannel.webhookSubscriptionExternalId)) {
      await driver
        .deleteSubscription(this.toContext(calendarChannel))
        .catch(() => undefined);
    }

    try {
      const result = await driver.createSubscription(
        calendarChannel.connectedAccountId,
        WebhookSubscriptionChannelType.CALENDAR,
        clientState,
      );

      await this.calendarChannelRepository.update(calendarChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionExternalResourceId: result.externalResourceId,
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.calendarChannelRepository.update(calendarChannel.id, {
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionExpiresAt: null,
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });

      throw error;
    }
  }

  async renewSubscription(
    calendarChannel: CalendarChannelEntity,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: calendarChannel.connectedAccountId,
        workspaceId: calendarChannel.workspaceId,
      },
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      const result = await driver.renewSubscription(
        this.toContext(calendarChannel),
      );

      await this.calendarChannelRepository.update(calendarChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionExternalResourceId: result.externalResourceId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.calendarChannelRepository.update(calendarChannel.id, {
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
      });

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: calendarChannel.workspaceId },
      });
    }
  }

  async deleteSubscription(
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: { id: calendarChannelId, workspaceId },
    });

    if (!isDefined(calendarChannel)) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: calendarChannel.connectedAccountId,
        workspaceId: calendarChannel.workspaceId,
      },
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      await driver.deleteSubscription(this.toContext(calendarChannel));
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: calendarChannel.workspaceId },
      });
    }
  }

  private toContext(
    calendarChannel: CalendarChannelEntity,
  ): WebhookSubscriptionContext {
    return {
      connectedAccountId: calendarChannel.connectedAccountId,
      channelType: WebhookSubscriptionChannelType.CALENDAR,
      externalSubscriptionId: calendarChannel.webhookSubscriptionExternalId,
      externalResourceId: calendarChannel.webhookSubscriptionExternalResourceId,
      clientState: calendarChannel.webhookSubscriptionClientState ?? '',
    };
  }
}
