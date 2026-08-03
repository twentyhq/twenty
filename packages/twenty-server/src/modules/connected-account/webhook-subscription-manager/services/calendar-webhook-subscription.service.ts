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
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
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
        webhookSubscriptionFailureCount: 0,
      });
    } catch (error) {
      await this.recordSubscriptionFailure({
        calendarChannel,
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
        webhookSubscriptionFailureCount: 0,
      });
    } catch (error) {
      await this.recordSubscriptionFailure({
        calendarChannel,
        error,
        workspaceId: calendarChannel.workspaceId,
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
    calendarChannel,
    error,
    workspaceId,
    additionalUpdate = {},
  }: {
    calendarChannel: Pick<
      CalendarChannelEntity,
      'id' | 'webhookSubscriptionFailureCount'
    >;
    error: unknown;
    workspaceId: string;
    additionalUpdate?: QueryDeepPartialEntity<CalendarChannelEntity>;
  }): Promise<void> {
    const failureCount = calendarChannel.webhookSubscriptionFailureCount + 1;

    await this.calendarChannelRepository.update(calendarChannel.id, {
      ...additionalUpdate,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
      webhookSubscriptionFailureCount: failureCount,
    });

    if (failureCount < WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS) {
      return;
    }

    this.exceptionHandlerService.captureExceptions([error], {
      additionalData: {
        calendarChannelId: calendarChannel.id,
        webhookSubscriptionFailureCount: failureCount,
      },
      workspace: { id: workspaceId },
    });
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
