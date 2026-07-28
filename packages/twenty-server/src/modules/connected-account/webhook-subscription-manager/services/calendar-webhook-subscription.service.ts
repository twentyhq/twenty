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
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountAuthFailureService } from 'src/modules/connected-account/services/connected-account-auth-failure.service';
import { isConnectedAccountReauthenticationRequiredException } from 'src/modules/connected-account/utils/is-connected-account-reauthentication-required-exception.util';
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
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly connectedAccountAuthFailureService: ConnectedAccountAuthFailureService,
  ) {}

  async createSubscription(
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
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

    // Keep any existing watch live until the replacement is created, then stop it.
    const previousSubscription = isDefined(
      calendarChannel.webhookSubscriptionExternalId,
    )
      ? this.toContext(calendarChannel)
      : null;

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

      await this.handleSubscriptionError({
        error,
        connectedAccountId: calendarChannel.connectedAccountId,
        calendarChannelId: calendarChannel.id,
        workspaceId,
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
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: { id: calendarChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(calendarChannel)) {
      return;
    }

    if (
      calendarChannel.webhookSubscriptionStatus !==
      WebhookSubscriptionStatus.ACTIVE
    ) {
      await this.createSubscription(calendarChannelId, workspaceId);

      return;
    }

    const { connectedAccount } = calendarChannel;

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

      await this.handleSubscriptionError({
        error,
        connectedAccountId: calendarChannel.connectedAccountId,
        calendarChannelId: calendarChannel.id,
        workspaceId: calendarChannel.workspaceId,
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
      if (isConnectedAccountReauthenticationRequiredException(error)) {
        return;
      }

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: calendarChannel.workspaceId },
        additionalData: {
          connectedAccountId: calendarChannel.connectedAccountId,
          calendarChannelId: calendarChannel.id,
        },
      });
    }
  }

  // A dead refresh token cannot be recovered by retrying: flag the account for
  // reconnection and swallow the error so the renewal cron stops looping on it.
  private async handleSubscriptionError({
    error,
    connectedAccountId,
    calendarChannelId,
    workspaceId,
  }: {
    error: unknown;
    connectedAccountId: string;
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    if (isConnectedAccountReauthenticationRequiredException(error)) {
      await this.connectedAccountAuthFailureService.markAuthFailed({
        connectedAccountId,
        workspaceId,
      });

      return;
    }

    this.exceptionHandlerService.captureExceptions([error], {
      workspace: { id: workspaceId },
      additionalData: { connectedAccountId, calendarChannelId },
    });

    throw error;
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
