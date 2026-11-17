import { Injectable } from '@nestjs/common';

import { type MarkAppThreadAsReadPayload } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { type MessagingProviderThreadReadMarker } from 'src/engine/metadata-modules/messaging-provider/types/messaging-provider-thread-read-marker.type';
import { findMessagingProviderLogicFunction } from 'src/engine/metadata-modules/messaging-provider/utils/find-messaging-provider-logic-function.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessagingProviderThreadReadMarkerService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async resolveMarker({
    messagingProviderUniversalIdentifier,
    connectionProviderId,
    workspaceId,
  }: {
    messagingProviderUniversalIdentifier: string | null;
    connectionProviderId: string;
    workspaceId: string;
  }): Promise<MessagingProviderThreadReadMarker | null> {
    const {
      flatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatMessagingProviderMaps',
      'flatConnectionProviderMaps',
      'flatLogicFunctionMaps',
    ]);

    const { messagingProvider, logicFunction } =
      findMessagingProviderLogicFunction({
        flatMessagingProviderMaps,
        flatConnectionProviderMaps,
        flatLogicFunctionMaps,
        messagingProviderUniversalIdentifier,
        connectionProviderId,
        getLogicFunctionUniversalIdentifier: (provider) =>
          provider.markThreadAsReadLogicFunctionUniversalIdentifier,
      });

    if (!isDefined(messagingProvider) || !isDefined(logicFunction)) {
      return null;
    }

    return {
      messagingProvider,
      markThreadAsReadLogicFunctionId: logicFunction.id,
    };
  }

  async markAsReadOrThrow({
    marker: { messagingProvider, markThreadAsReadLogicFunctionId },
    workspaceId,
    payload,
  }: {
    marker: MessagingProviderThreadReadMarker;
    workspaceId: string;
    payload: Omit<MarkAppThreadAsReadPayload, 'messagingProviderName'>;
  }): Promise<void> {
    await this.logicFunctionExecutorService.executeOrThrow({
      logicFunctionId: markThreadAsReadLogicFunctionId,
      workspaceId,
      payload: { messagingProviderName: messagingProvider.name, ...payload },
      shouldEnforceUsageLimits: true,
      toException: (reason) =>
        new MessagingProviderException(
          `markThreadAsRead logic function of messaging provider ${messagingProvider.id} ${reason}`,
          MessagingProviderExceptionCode.MARK_THREAD_AS_READ_FAILED,
        ),
    });
  }
}
