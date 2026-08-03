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
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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
export class MessagingWebhookSubscriptionService {
  private readonly logger = new Logger(
    MessagingWebhookSubscriptionService.name,
  );

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly webhookSubscriptionDriverFactory: WebhookSubscriptionDriverFactory,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(messageChannel?.connectedAccount)) {
      return;
    }

    const { connectedAccount } = messageChannel;

    if (
      !this.webhookSubscriptionDriverFactory.isProviderSupported(
        connectedAccount.provider,
      )
    ) {
      return;
    }

    if (
      messageChannel.webhookSubscriptionStatus ===
      WebhookSubscriptionStatus.ACTIVE
    ) {
      return;
    }

    const clientState = messageChannel.webhookSubscriptionClientState ?? v4();
    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    // Keep any existing watch live until the replacement is created, then stop it.
    const previousSubscription = isDefined(
      messageChannel.webhookSubscriptionExternalId,
    )
      ? this.toContext(messageChannel)
      : null;

    try {
      const result = await driver.createSubscription(
        messageChannel.connectedAccountId,
        WebhookSubscriptionChannelType.MESSAGING,
        clientState,
      );

      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionClientState: clientState,
        webhookSubscriptionExpiresAt: null,
      });

      await this.handleDriverException(
        error,
        'CREATE',
        messageChannel.id,
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
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messageChannelRepository.update(
      { id: messageChannelId, workspaceId },
      {
        webhookSubscriptionExternalId: null,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionExpiresAt: null,
      },
    );

    await this.createSubscription(messageChannelId, workspaceId);
  }

  async renewSubscription({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
      relations: ['connectedAccount'],
    });

    if (!isDefined(messageChannel)) {
      return;
    }

    if (
      messageChannel.webhookSubscriptionStatus !==
      WebhookSubscriptionStatus.ACTIVE
    ) {
      await this.createSubscription(messageChannelId, workspaceId);

      return;
    }

    const { connectedAccount } = messageChannel;

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      const result = await driver.renewSubscription(
        this.toContext(messageChannel),
      );

      await this.messageChannelRepository.update(messageChannel.id, {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
      });
    } catch (error) {
      await this.handleDriverException(
        error,
        'RENEW',
        messageChannel.id,
        messageChannel.workspaceId,
      );
    }
  }

  async deleteSubscription(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
    });

    if (!isDefined(messageChannel)) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: messageChannel.connectedAccountId,
        workspaceId: messageChannel.workspaceId,
      },
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    const driver = this.webhookSubscriptionDriverFactory.getDriver(
      connectedAccount.provider,
    );

    try {
      await driver.deleteSubscription(this.toContext(messageChannel));
    } catch (error) {
      if (
        error instanceof WebhookSubscriptionDriverException &&
        error.code === WebhookSubscriptionDriverExceptionCode.NOT_FOUND
      ) {
        return;
      }

      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: messageChannel.workspaceId },
      });
    }
  }

  private async handleDriverException(
    exception: unknown,
    operation: WebhookSubscriptionOperation,
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (exception instanceof WebhookSubscriptionDriverException) {
      switch (exception.code) {
        case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
          await this.handleNotFoundException(
            exception,
            operation,
            messageChannelId,
            workspaceId,
          );

          return;
        case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          await this.stopWatching(exception, messageChannelId);

          return;
        case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
          await this.messageChannelRepository.update(messageChannelId, {
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

    await this.messageChannelRepository.update(messageChannelId, {
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
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (operation === 'CREATE') {
      await this.stopWatching(exception, messageChannelId);

      return;
    }

    await this.recreateSubscription({ messageChannelId, workspaceId });
  }

  private async stopWatching(
    exception: WebhookSubscriptionDriverException,
    messageChannelId: string,
  ): Promise<void> {
    await this.messageChannelRepository.update(messageChannelId, {
      webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
    });

    this.logger.warn(
      `Stopped watching message channel ${messageChannelId}: ${exception.message}`,
    );
  }

  private toContext(
    messageChannel: MessageChannelEntity,
  ): WebhookSubscriptionContext {
    return {
      connectedAccountId: messageChannel.connectedAccountId,
      channelType: WebhookSubscriptionChannelType.MESSAGING,
      externalSubscriptionId: messageChannel.webhookSubscriptionExternalId,
      externalResourceId: null,
      clientState: messageChannel.webhookSubscriptionClientState ?? '',
    };
  }
}
