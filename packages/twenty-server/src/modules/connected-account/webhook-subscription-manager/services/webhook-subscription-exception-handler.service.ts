import { Injectable } from '@nestjs/common';

import {
  type WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-max-failure-count.constant';
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
  'id' | 'webhookSubscriptionExternalId' | 'webhookSubscriptionFailureCount'
>;

@Injectable()
export class WebhookSubscriptionExceptionHandlerService {
  constructor(
    private readonly webhookSubscriptionStatusService: WebhookSubscriptionStatusService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  public async handleDriverException({
    exception,
    operation,
    channelType,
    channel,
    workspaceId,
  }: {
    exception: unknown;
    operation: WebhookSubscriptionOperation;
    channelType: WebhookSubscriptionChannelType;
    channel: WebhookSubscribableChannelReference;
    workspaceId: string;
  }): Promise<WebhookSubscriptionRecoveryAction> {
    if (
      exception instanceof WebhookSubscriptionDriverException ||
      exception instanceof ConnectedAccountRefreshAccessTokenException
    ) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          return await this.handleNotFoundException({
            operation,
            channelType,
            channel,
            workspaceId,
          });
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
          return await this.handleTemporaryException({
            exception,
            operation,
            channelType,
            channel,
            workspaceId,
          });
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
          return await this.handleInsufficientPermissionsException(
            channelType,
            channel,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
        case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
        case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
        default:
          return await this.handleUnknownException({
            exception,
            channelType,
            channel,
            workspaceId,
          });
      }
    }

    return await this.handleUnknownException({
      exception,
      channelType,
      channel,
      workspaceId,
    });
  }

  private async handleNotFoundException({
    operation,
    channelType,
    channel,
    workspaceId,
  }: {
    operation: WebhookSubscriptionOperation;
    channelType: WebhookSubscriptionChannelType;
    channel: WebhookSubscribableChannelReference;
    workspaceId: string;
  }): Promise<WebhookSubscriptionRecoveryAction> {
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
    await this.webhookSubscriptionStatusService.markAsPermanentlyFailed(
      channelType,
      channel.id,
      WebhookSubscriptionStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );

    return 'NONE';
  }

  private async handleTemporaryException({
    exception,
    operation,
    channelType,
    channel,
    workspaceId,
  }: {
    exception: { message: string };
    operation: WebhookSubscriptionOperation;
    channelType: WebhookSubscriptionChannelType;
    channel: WebhookSubscribableChannelReference;
    workspaceId: string;
  }): Promise<WebhookSubscriptionRecoveryAction> {
    if (
      channel.webhookSubscriptionFailureCount >=
      WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT
    ) {
      await this.webhookSubscriptionStatusService.markAsPermanentlyFailed(
        channelType,
        channel.id,
        WebhookSubscriptionStatus.FAILED_UNKNOWN,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          new Error(
            `Temporary error occurred ${WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT} times while running ${operation} on the webhook subscription of ${channelType} channel ${channel.id} in workspace ${workspaceId}: ${exception.message}`,
          ),
        ],
        {
          additionalData: {
            channelId: channel.id,
            channelType,
            operation,
            webhookSubscriptionFailureCount:
              channel.webhookSubscriptionFailureCount,
          },
          workspace: { id: workspaceId },
        },
      );

      return 'NONE';
    }

    await this.webhookSubscriptionStatusService.markAsFailed(
      channelType,
      channel.id,
    );

    throw exception;
  }

  private async handleUnknownException({
    exception,
    channelType,
    channel,
    workspaceId,
  }: {
    exception: unknown;
    channelType: WebhookSubscriptionChannelType;
    channel: WebhookSubscribableChannelReference;
    workspaceId: string;
  }): Promise<WebhookSubscriptionRecoveryAction> {
    this.exceptionHandlerService.captureExceptions([exception], {
      workspace: { id: workspaceId },
    });

    if (
      channel.webhookSubscriptionFailureCount >=
      WEBHOOK_SUBSCRIPTION_MAX_FAILURE_COUNT
    ) {
      await this.webhookSubscriptionStatusService.markAsPermanentlyFailed(
        channelType,
        channel.id,
        WebhookSubscriptionStatus.FAILED_UNKNOWN,
      );

      return 'NONE';
    }

    await this.webhookSubscriptionStatusService.markAsFailed(
      channelType,
      channel.id,
    );

    throw exception;
  }
}
