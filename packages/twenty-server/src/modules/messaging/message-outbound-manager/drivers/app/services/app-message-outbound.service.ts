import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type AppSendMessagePayload } from 'src/modules/messaging/message-outbound-manager/drivers/app/types/app-send-message-payload.type';
import { parseAppSendMessageResultOrThrow } from 'src/modules/messaging/message-outbound-manager/drivers/app/utils/parse-app-send-message-result-or-throw.util';
import {
  MessageOutboundDriverException,
  MessageOutboundDriverExceptionCode,
} from 'src/modules/messaging/message-outbound-manager/drivers/exceptions/message-outbound-driver.exception';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class AppMessageOutboundService implements MessageOutboundDriver {
  constructor(
    @InjectRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: Repository<ConnectionProviderEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    if (!isDefined(connectedAccount.connectionProviderId)) {
      throw new MessageOutboundDriverException(
        `Connected account ${connectedAccount.id} has no connection provider`,
        MessageOutboundDriverExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    const connectionProvider = await this.connectionProviderRepository.findOne({
      where: {
        id: connectedAccount.connectionProviderId,
        workspaceId: connectedAccount.workspaceId,
      },
    });

    if (!isDefined(connectionProvider)) {
      throw new MessageOutboundDriverException(
        `Connection provider ${connectedAccount.connectionProviderId} not found for connected account ${connectedAccount.id}`,
        MessageOutboundDriverExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    if (!isDefined(connectionProvider.messagingSettings)) {
      throw new MessageOutboundDriverException(
        `Connection provider ${connectionProvider.id} has no messaging settings`,
        MessageOutboundDriverExceptionCode.CHANNEL_MISCONFIGURED,
      );
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(
        connectedAccount.workspaceId,
        ['flatLogicFunctionMaps'],
      );

    const flatLogicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        connectionProvider.messagingSettings
          .sendMessageFunctionUniversalIdentifier
      ];

    if (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt)
    ) {
      throw new MessageOutboundDriverException(
        `Send message function ${connectionProvider.messagingSettings.sendMessageFunctionUniversalIdentifier} not found for connection provider ${connectionProvider.id}`,
        MessageOutboundDriverExceptionCode.SEND_MESSAGE_FUNCTION_NOT_FOUND,
      );
    }

    const accessToken =
      this.connectedAccountTokenEncryptionService.decryptNullable({
        ciphertext: connectedAccount.accessToken,
        workspaceId: connectedAccount.workspaceId,
      });

    const payload: AppSendMessagePayload = {
      input: {
        ...sendMessageInput,
        attachments: sendMessageInput.attachments?.map((attachment) => ({
          filename: attachment.filename,
          contentType: attachment.contentType,
          content: attachment.content.toString('base64'),
        })),
      },
      connectedAccount: {
        id: connectedAccount.id,
        handle: connectedAccount.handle,
        accessToken,
      },
    };

    const executionResult = await this.logicFunctionExecutorService.execute({
      logicFunctionId: flatLogicFunction.id,
      workspaceId: connectedAccount.workspaceId,
      payload,
    });

    if (
      isDefined(executionResult.error) ||
      executionResult.status !== LogicFunctionExecutionStatus.SUCCESS
    ) {
      throw new MessageOutboundDriverException(
        `Send message function failed: ${executionResult.error?.errorMessage ?? executionResult.status}`,
        MessageOutboundDriverExceptionCode.SEND_MESSAGE_FUNCTION_FAILED,
      );
    }

    return parseAppSendMessageResultOrThrow(executionResult.data);
  }

  async createDraft(): Promise<void> {
    throw new MessageOutboundDriverException(
      'App connection providers do not support creating drafts',
      MessageOutboundDriverExceptionCode.DRAFTS_NOT_SUPPORTED,
    );
  }

  async sendDraft(): Promise<SendMessageResult> {
    throw new MessageOutboundDriverException(
      'App connection providers do not support sending drafts',
      MessageOutboundDriverExceptionCode.DRAFTS_NOT_SUPPORTED,
    );
  }
}
