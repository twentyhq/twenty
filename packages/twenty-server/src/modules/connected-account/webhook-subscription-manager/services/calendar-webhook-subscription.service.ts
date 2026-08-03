import { Injectable, Logger } from '@nestjs/common';
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
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';
import {
  type WebhookSubscriptionContext,
  type WebhookSubscriptionOperation,
} from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

@Injectable()
export class CalendarWebhookSubscriptionService {
  private readonly logger = new Logger(CalendarWebhookSubscriptionService.name);

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
      });
    } catch (error) {
      await this.calendarChannelRepository.update(calendarChannel.id, {
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionExpiresAt: null,
      });

      await this.handleDriverException(
        error,
        'CREATE',
        calendarChannel.id,
        workspaceId,
      );

      return;
    }

    if (isDefined(previousSubscription)) {
      await driver
        .deleteSubscription(previousSubscription)
        .catch(() => undefined);
    }
  }

  async recreateSubscription({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.calendarChannelRepository.update(
      { id: calendarChannelId, workspaceId },
      {
        webhookSubscriptionExternalId: null,
        webhookSubscriptionExternalResourceId: null,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionExpiresAt: null,
      },
    );

    await this.createSubscription(calendarChannelId, workspaceId);
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
      await this.handleDriverException(
        error,
        'RENEW',
        calendarChannel.id,
        calendarChannel.workspaceId,
      );
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
      if (
        error instanceof WebhookSubscriptionDriverException &&
        error.code === WebhookSubscriptionDriverExceptionCode.NOT_FOUND
      ) {
        return;
      }

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: calendarChannel.workspaceId },
      });
    }
  }

  private async handleDriverException(
    exception: unknown,
    operation: WebhookSubscriptionOperation,
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (exception instanceof WebhookSubscriptionDriverException) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          await this.handleNotFoundException(
            exception,
            operation,
            calendarChannelId,
            workspaceId,
          );

          return;
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          await this.stopWatching(exception, calendarChannelId);

          return;
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
          await this.calendarChannelRepository.update(calendarChannelId, {
            webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
          });

          throw exception;
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
        case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
        case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
        default:
          break;
      }
    }

    await this.calendarChannelRepository.update(calendarChannelId, {
      webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
    });

    this.exceptionHandlerService.captureExceptions([exception], {
      workspace: { id: workspaceId },
    });

    throw exception;
  }

  private async handleNotFoundException(
    exception: WebhookSubscriptionDriverException,
    operation: WebhookSubscriptionOperation,
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (operation === 'CREATE') {
      await this.stopWatching(exception, calendarChannelId);

      return;
    }

    await this.recreateSubscription({ calendarChannelId, workspaceId });
  }

  private async stopWatching(
    exception: WebhookSubscriptionDriverException,
    calendarChannelId: string,
  ): Promise<void> {
    await this.calendarChannelRepository.update(calendarChannelId, {
      webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
    });

    this.logger.warn(
      `Stopped watching calendar channel ${calendarChannelId}: ${exception.message}`,
    );
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
