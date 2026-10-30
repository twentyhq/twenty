import { Injectable } from '@nestjs/common';

import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { findApplicationFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/find-application-flat-logic-function.util';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { type MessagingProviderSender } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-sender.type';
import { findMessagingProviderOnConnectionProvider } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-on-connection-provider.util';
import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessagingProviderMessageSenderService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async resolveSenderOrThrow({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    messageChannelId,
    workspaceId,
  }: {
    messagingProviderUniversalIdentifier: string | null;
    connectionProviderId: string;
    messageChannelId: string;
    workspaceId: string;
  }): Promise<MessagingProviderSender> {
    const {
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatMessagingProviderMaps',
      'flatConnectionProviderMaps',
      'flatLogicFunctionMaps',
    ]);

    const messagingProvider = findMessagingProviderOnConnectionProvider({
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      messagingProviderUniversalIdentifier,
      connectionProviderId,
    });

    if (!isDefined(messagingProvider)) {
      throw new MessagingProviderException(
        `Message channel ${messageChannelId} has no messaging provider on its connection provider`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

    const sendMessageLogicFunction = findApplicationFlatLogicFunction({
      flatLogicFunctionMaps,
      universalIdentifier:
        messagingProvider.sendMessageLogicFunctionUniversalIdentifier,
      applicationId: messagingProvider.applicationId,
    });

    if (!isDefined(sendMessageLogicFunction)) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} has no sendMessage logic function in its application`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

    return {
      messagingProvider,
      sendMessageLogicFunctionId: sendMessageLogicFunction.id,
    };
  }

  async sendOrThrow({
    sender: { messagingProvider, sendMessageLogicFunctionId },
    workspaceId,
    payload,
  }: {
    sender: MessagingProviderSender;
    workspaceId: string;
    payload: Omit<SendAppMessagePayload, 'messagingProviderName'>;
  }): Promise<SendAppMessageResult> {
    const data = await this.logicFunctionExecutorService.executeOrThrow({
      logicFunctionId: sendMessageLogicFunctionId,
      workspaceId,
      payload: { messagingProviderName: messagingProvider.name, ...payload },
      shouldEnforceUsageLimits: true,
      toException: (reason) =>
        new MessagingProviderException(
          `sendMessage logic function of messaging provider ${messagingProvider.id} ${reason}`,
          MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
        ),
    });

    const parsedResult = parseSendAppMessageResult(data);

    if (!parsedResult.isValid) {
      throw new MessagingProviderException(
        `sendMessage logic function of messaging provider ${messagingProvider.id} returned an invalid result: ${parsedResult.reason}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
      );
    }

    return parsedResult.sentMessage;
  }
}
