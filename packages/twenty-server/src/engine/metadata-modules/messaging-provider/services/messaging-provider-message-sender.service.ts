import { Injectable } from '@nestjs/common';

import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class MessagingProviderMessageSenderService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  // failures propagate so a message the app could not deliver is never recorded as sent
  async sendOrThrow({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    workspaceId,
    payload,
  }: {
    messagingProviderUniversalIdentifier: string | null;
    connectionProviderId: string;
    workspaceId: string;
    payload: Omit<SendAppMessagePayload, 'messagingProviderName'>;
  }): Promise<SendAppMessageResult> {
    const {
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatMessagingProviderMaps',
      'flatConnectionProviderMaps',
      'flatLogicFunctionMaps',
    ]);

    const messagingProvider = isDefined(messagingProviderUniversalIdentifier)
      ? flatMessagingProviderMaps.byUniversalIdentifier[
          messagingProviderUniversalIdentifier
        ]
      : undefined;

    if (!isDefined(messagingProvider)) {
      throw new MessagingProviderException(
        `Message channel ${payload.messageChannelId} has no messaging provider`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

    const connectionProvider =
      flatConnectionProviderMaps.byUniversalIdentifier[
        messagingProvider.connectionProviderUniversalIdentifier
      ];

    if (connectionProvider?.id !== connectionProviderId) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} does not use the connection provider of message channel ${payload.messageChannelId}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

    const sendMessageLogicFunction = isDefined(
      messagingProvider.sendMessageLogicFunctionUniversalIdentifier,
    )
      ? flatLogicFunctionMaps.byUniversalIdentifier[
          messagingProvider.sendMessageLogicFunctionUniversalIdentifier
        ]
      : undefined;

    if (
      !isDefined(sendMessageLogicFunction) ||
      isDefined(sendMessageLogicFunction.deletedAt) ||
      sendMessageLogicFunction.applicationId !== messagingProvider.applicationId
    ) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} has no sendMessage logic function in its application`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

    const executionResult: LogicFunctionExecuteResult =
      await this.logicFunctionExecutorService
        .execute({
          logicFunctionId: sendMessageLogicFunction.id,
          workspaceId,
          payload: {
            messagingProviderName: messagingProvider.name,
            ...payload,
          },
          shouldEnforceUsageLimits: true,
        })
        .catch((error: unknown) => {
          if (error instanceof CustomException) {
            throw error;
          }

          throw new MessagingProviderException(
            `sendMessage logic function of messaging provider ${messagingProvider.id} could not be executed: ${error instanceof Error ? error.message : String(error)}`,
            MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
          );
        });

    if (isDefined(executionResult.error)) {
      throw new MessagingProviderException(
        `sendMessage logic function of messaging provider ${messagingProvider.id} failed: ${executionResult.error.errorMessage}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
      );
    }

    const parsedResult = parseSendAppMessageResult(executionResult.data);

    if (!parsedResult.isValid) {
      throw new MessagingProviderException(
        `sendMessage logic function of messaging provider ${messagingProvider.id} returned an invalid result: ${parsedResult.reason}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
      );
    }

    return parsedResult.sentMessage;
  }
}
