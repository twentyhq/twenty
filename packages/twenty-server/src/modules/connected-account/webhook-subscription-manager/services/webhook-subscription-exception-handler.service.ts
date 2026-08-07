import { Injectable } from '@nestjs/common';

import { type WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { WebhookSubscriptionStatusService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-status.service';
import {
  type WebhookSubscribableChannel,
  type WebhookSubscriptionOperation,
  type WebhookSubscriptionRecoveryAction,
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
  ): Promise<WebhookSubscriptionRecoveryAction> {
    if (exception instanceof WebhookSubscriptionDriverException) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          return await this.handleNotFoundException(
            operation,
            channelType,
            channel,
            workspaceId,
          );
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          return await this.handleInsufficientPermissionsException(
            channelType,
            channel,
          );
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
          return await this.handleTemporaryException(
            exception,
            channelType,
            channel,
          );
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
        case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
        case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
        default:
          return await this.handleUnknownException(
            exception,
            channelType,
            channel,
            workspaceId,
          );
      }
    }

    if (exception instanceof ConnectedAccountRefreshAccessTokenException) {
      switch (exception.code) {
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
          return await this.handleInsufficientPermissionsException(
            channelType,
            channel,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
          return await this.handleTemporaryException(
            exception,
            channelType,
            channel,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
        default:
          return await this.handleUnknownException(
            exception,
            channelType,
            channel,
            workspaceId,
          );
      }
    }

    return await this.handleUnknownException(
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
  ): Promise<WebhookSubscriptionRecoveryAction> {
    if (operation === 'CREATE') {
      return await this.handleInsufficientPermissionsException(
        channelType,
        channel,
      );
    }

    const cleared =
      await this.webhookSubscriptionStatusService.clearRemovedSubscription(
        channelType,
        channel.id,
        workspaceId,
        channel.webhookSubscriptionExternalId,
      );

    return cleared ? 'RECREATE' : 'NONE';
  }

  private async handleInsufficientPermissionsException(
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
  ): Promise<WebhookSubscriptionRecoveryAction> {
    await this.webhookSubscriptionStatusService.markAsExpired(
      channelType,
      channel.id,
    );

    return 'NONE';
  }

  private async handleTemporaryException(
    exception:
      | WebhookSubscriptionDriverException
      | ConnectedAccountRefreshAccessTokenException,
    channelType: WebhookSubscriptionChannelType,
    channel: WebhookSubscribableChannelReference,
  ): Promise<WebhookSubscriptionRecoveryAction> {
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
  ): Promise<WebhookSubscriptionRecoveryAction> {
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
