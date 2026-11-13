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
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { type MessagingProviderConversationStarter } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-conversation-starter.type';
import { type MessagingProviderSender } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-sender.type';
import { findMessagingProviderLogicFunction } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-logic-function.util';
import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';
import { parseStartAppConversationResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-start-app-conversation-result.util';
import { supportsConversationStart } from 'src/engine/metadata-modules/messaging-provider/utils/supports-conversation-start.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ConversationStarterLookup = {
  messagingProviderUniversalIdentifier: string | null;
  connectionProviderId: string;
  workspaceId: string;
};

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

    const { messagingProvider, logicFunction: sendMessageLogicFunction } =
      findMessagingProviderLogicFunction({
        flatMessagingProviderMaps,
        flatConnectionProviderMaps,
        flatLogicFunctionMaps,
        messagingProviderUniversalIdentifier,
        connectionProviderId,
        getLogicFunctionUniversalIdentifier: (provider) =>
          provider.sendMessageLogicFunctionUniversalIdentifier,
      });

    if (!isDefined(messagingProvider)) {
      throw new MessagingProviderException(
        `Message channel ${messageChannelId} has no messaging provider on its connection provider`,
        MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE,
      );
    }

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

  async resolveConversationStarterOrThrow({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    messageChannelId,
    workspaceId,
  }: ConversationStarterLookup & {
    messageChannelId: string;
  }): Promise<MessagingProviderConversationStarter> {
    const { messagingProvider, logicFunction } =
      await this.findStartConversationLogicFunction({
        messagingProviderUniversalIdentifier,
        connectionProviderId,
        workspaceId,
      });

    if (!isDefined(messagingProvider)) {
      throw new MessagingProviderException(
        `Message channel ${messageChannelId} has no messaging provider on its connection provider`,
        MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE,
      );
    }

    if (!isDefined(logicFunction)) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} has no startConversation logic function in its application`,
        MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE,
      );
    }

    if (!supportsConversationStart(messagingProvider)) {
      throw new MessagingProviderException(
        `Messaging provider ${messagingProvider.id} sends email-style messages: starting a conversation is not supported`,
        MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE,
      );
    }

    return {
      messagingProvider,
      startConversationLogicFunctionId: logicFunction.id,
    };
  }

  async canStartConversation(
    lookup: ConversationStarterLookup,
  ): Promise<boolean> {
    const { messagingProvider, logicFunction } =
      await this.findStartConversationLogicFunction(lookup);

    return (
      isDefined(messagingProvider) &&
      isDefined(logicFunction) &&
      supportsConversationStart(messagingProvider)
    );
  }

  async sendOrThrow({
    sender: { messagingProvider, sendMessageLogicFunctionId },
    workspaceId,
    payload,
  }: {
    sender: MessagingProviderSender;
    workspaceId: string;
    payload: SendAppMessagePayload;
  }): Promise<SendAppMessageResult> {
    const data = await this.logicFunctionExecutorService.executeOrThrow({
      logicFunctionId: sendMessageLogicFunctionId,
      workspaceId,
      payload,
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

  private async findStartConversationLogicFunction({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    workspaceId,
  }: ConversationStarterLookup) {
    const {
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatMessagingProviderMaps',
      'flatConnectionProviderMaps',
      'flatLogicFunctionMaps',
    ]);

    return findMessagingProviderLogicFunction({
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
      messagingProviderUniversalIdentifier,
      connectionProviderId,
      getLogicFunctionUniversalIdentifier: (provider: FlatMessagingProvider) =>
        provider.startConversationLogicFunctionUniversalIdentifier,
    });
  }
}
