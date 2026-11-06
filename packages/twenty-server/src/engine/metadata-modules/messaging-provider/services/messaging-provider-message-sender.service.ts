import { Injectable } from '@nestjs/common';

import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
  type StartAppConversationPayload,
  type StartAppConversationResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findApplicationFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/find-application-flat-logic-function.util';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { type MessagingProviderConversationStarter } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-conversation-starter.type';
import { type MessagingProviderSender } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-sender.type';
import { findMessagingProviderOnConnectionProvider } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-on-connection-provider.util';
import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';
import { parseStartAppConversationResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-start-app-conversation-result.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type MessagingProviderLookup = {
  messagingProviderUniversalIdentifier: string | null;
  connectionProviderId: string;
  messageChannelId: string;
  workspaceId: string;
};

@Injectable()
export class MessagingProviderMessageSenderService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async resolveSenderOrThrow(
    lookup: MessagingProviderLookup,
  ): Promise<MessagingProviderSender> {
    const { messagingProvider, logicFunction } =
      await this.resolveLogicFunctionOrThrow({
        ...lookup,
        getLogicFunctionUniversalIdentifier: (provider) =>
          provider.sendMessageLogicFunctionUniversalIdentifier,
        notAvailableCode:
          MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
        logicFunctionLabel: 'sendMessage',
      });

    return {
      messagingProvider,
      sendMessageLogicFunctionId: logicFunction.id,
    };
  }

  async resolveConversationStarterOrThrow(
    lookup: MessagingProviderLookup,
  ): Promise<MessagingProviderConversationStarter> {
    const { messagingProvider, logicFunction } =
      await this.resolveLogicFunctionOrThrow({
        ...lookup,
        getLogicFunctionUniversalIdentifier: (provider) =>
          provider.startConversationLogicFunctionUniversalIdentifier,
        notAvailableCode:
          MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE,
        logicFunctionLabel: 'startConversation',
      });

    return {
      messagingProvider,
      startConversationLogicFunctionId: logicFunction.id,
    };
  }

  async canStartConversation({
    messagingProviderUniversalIdentifier,
    workspaceId,
  }: {
    messagingProviderUniversalIdentifier: string | null;
    workspaceId: string;
  }): Promise<boolean> {
    if (!isDefined(messagingProviderUniversalIdentifier)) {
      return false;
    }

    const { flatMessagingProviderMaps, flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatMessagingProviderMaps',
        'flatLogicFunctionMaps',
      ]);

    const messagingProvider =
      flatMessagingProviderMaps.byUniversalIdentifier[
        messagingProviderUniversalIdentifier
      ];

    return (
      isDefined(messagingProvider) &&
      isDefined(
        findApplicationFlatLogicFunction({
          flatLogicFunctionMaps,
          universalIdentifier:
            messagingProvider.startConversationLogicFunctionUniversalIdentifier,
          applicationId: messagingProvider.applicationId,
        }),
      )
    );
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

  async startConversationOrThrow({
    conversationStarter: {
      messagingProvider,
      startConversationLogicFunctionId,
    },
    workspaceId,
    payload,
  }: {
    conversationStarter: MessagingProviderConversationStarter;
    workspaceId: string;
    payload: Omit<StartAppConversationPayload, 'messagingProviderName'>;
  }): Promise<StartAppConversationResult> {
    const data = await this.logicFunctionExecutorService.executeOrThrow({
      logicFunctionId: startConversationLogicFunctionId,
      workspaceId,
      payload: { messagingProviderName: messagingProvider.name, ...payload },
      shouldEnforceUsageLimits: true,
      toException: (reason) =>
        new MessagingProviderException(
          `startConversation logic function of messaging provider ${messagingProvider.id} ${reason}`,
          MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
        ),
    });

    const parsedResult = parseStartAppConversationResult(data);

    if (!parsedResult.isValid) {
      throw new MessagingProviderException(
        `startConversation logic function of messaging provider ${messagingProvider.id} returned an invalid result: ${parsedResult.reason}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
      );
    }

    return parsedResult.startedConversation;
  }

  private async resolveLogicFunctionOrThrow({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    messageChannelId,
    workspaceId,
    getLogicFunctionUniversalIdentifier,
    notAvailableCode,
    logicFunctionLabel,
  }: MessagingProviderLookup & {
    getLogicFunctionUniversalIdentifier: (
      messagingProvider: FlatMessagingProvider,
    ) => string | null;
    notAvailableCode:
      | MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE
      | MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE;
    logicFunctionLabel: string;
  }): Promise<{
    messagingProvider: FlatMessagingProvider;
    logicFunction: FlatLogicFunction;
  }> {
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
        notAvailableCode,
      );
    }

    const logicFunction = findApplicationFlatLogicFunction({
      flatLogicFunctionMaps,
      universalIdentifier:
        getLogicFunctionUniversalIdentifier(messagingProvider),
      applicationId: messagingProvider.applicationId,
    });

    if (!isDefined(logicFunction)) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} has no ${logicFunctionLabel} logic function in its application`,
        notAvailableCode,
      );
    }

    return { messagingProvider, logicFunction };
  }
}
