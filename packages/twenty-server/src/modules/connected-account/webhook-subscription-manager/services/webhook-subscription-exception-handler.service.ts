import { Injectable } from '@nestjs/common';

import { type WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { WebhookSubscriptionStatusService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-status.service';
import {
  type WebhookSubscribableChannel,
  type WebhookSubscriptionOperation,
} from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

type WebhookSubscribableChannelReference = Pick<
  WebhookSubscribableChannel,
  'id' | 'webhookSubscriptionExternalId'
>;

@Injectable()
export class WebhookSubscriptionExceptionHandlerService {
  constructor(
    private readonly webhookSubscriptionStatusService: WebhookSubscriptionStatusService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  public async handleDriverException(
    exception: unknown,
    operation: WebhookSubscriptionOperation,
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
    workspaceId: string,
  ): Promise<void> {
    if (exception instanceof WebhookSubscriptionDriverException) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          await this.handleNotFoundException(
            operation,
            channelType,
            channel,
            workspaceId,
          );
          break;
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          await this.handleInsufficientPermissionsException(
            channelType,
            channel,
          );
          break;
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
          await this.handleTemporaryException(exception, channelType, channel);
          break;
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
        case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
        case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
        default:
          await this.handleUnknownException(
            exception,
            channelType,
            channel,
            workspaceId,
          );
          break;
      }

      return;
    }

    await this.handleUnknownException(
      exception,
      channelType,
      channel,
      workspaceId,
    );
  }

  private async handleNotFoundException(
    operation: WebhookSubscriptionOperation,
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
    workspaceId: string,
  ): Promise<void> {
    if (operation === 'CREATE') {
      await this.handleInsufficientPermissionsException(channelType, channel);

      return;
    }

    await this.webhookSubscriptionStatusService.clearRemovedSubscription(
      channelType,
      channel.id,
      workspaceId,
      channel.webhookSubscriptionExternalId,
    );
  }

  private async handleInsufficientPermissionsException(
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
  ): Promise<void> {
    await this.webhookSubscriptionStatusService.markAsExpired(
      channelType,
      channel.id,
    );
  }

  private async handleTemporaryException(
    exception: WebhookSubscriptionDriverException,
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
  ): Promise<void> {
    await this.webhookSubscriptionStatusService.markAsFailed(
      channelType,
      channel.id,
    );

    throw exception;
  }

  private async handleUnknownException(
    exception: unknown,
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
    workspaceId: string,
  ): Promise<void> {
    await this.webhookSubscriptionStatusService.markAsFailed(
      channelType,
      channel.id,
    );

    this.exceptionHandlerService.captureExceptions([exception], {
      workspace: { id: workspaceId },
    });

    throw exception;
  }
}
