import { Injectable } from '@nestjs/common';

import { type WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { WEBHOOK_SUBSCRIPTION_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-max-attempts.constant';
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
  }): Promise<void> {
    if (
      exception instanceof WebhookSubscriptionDriverException ||
      exception instanceof ConnectedAccountRefreshAccessTokenException
    ) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          await this.handleNotFoundException({
            operation,
            channelType,
            channel,
            workspaceId,
          });
          break;
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
          await this.handleTemporaryException({
            exception,
            operation,
            channelType,
            channel,
            workspaceId,
          });
          break;
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
          await this.handleInsufficientPermissionsException(
            channelType,
            channel,
          );
          break;
        case ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
        case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
        case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
        case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
        default:
          await this.handleUnknownException({
            exception,
            channelType,
            channel,
            workspaceId,
          });
          break;
      }
    } else {
      await this.handleUnknownException({
        exception,
        channelType,
        channel,
        workspaceId,
      });
    }
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
  }): Promise<void> {
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
  }): Promise<void> {
    if (
      channel.webhookSubscriptionFailureCount >=
      WEBHOOK_SUBSCRIPTION_MAX_ATTEMPTS
    ) {
      await this.webhookSubscriptionStatusService.markAsExpired(
        channelType,
        channel.id,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          new Error(
            `Temporary error occurred ${WEBHOOK_SUBSCRIPTION_MAX_ATTEMPTS} times while running ${operation} on the webhook subscription of ${channelType} channel ${channel.id} in workspace ${workspaceId}: ${exception.message}`,
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

      return;
    }

    await this.webhookSubscriptionStatusService.incrementFailureCount(
      channelType,
      channel.id,
    );

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
  }): Promise<void> {
    await this.webhookSubscriptionStatusService.markAsExpired(
      channelType,
      channel.id,
    );

    this.exceptionHandlerService.captureExceptions([exception], {
      workspace: { id: workspaceId },
    });

    throw exception;
  }
}
