import { Injectable, Logger } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const BROWSING_CONTEXT_TTL_MILLISECONDS = 86_400_000;

type MessageBrowsingContext = {
  messageId: string;
  browsingContext: BrowsingContextType | null;
};

@Injectable()
export class AgentChatBrowsingContextService {
  private readonly logger = new Logger(AgentChatBrowsingContextService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleAiChat)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private getThreadKey(threadId: string): string {
    return `browsing-context:${threadId}`;
  }

  async remember({
    threadId,
    messageId,
    browsingContext,
  }: {
    threadId: string;
    messageId: string;
    browsingContext: BrowsingContextType | null | undefined;
  }): Promise<void> {
    if (isUndefined(browsingContext)) {
      return;
    }

    const messageBrowsingContext: MessageBrowsingContext = {
      messageId,
      browsingContext,
    };

    try {
      await this.cacheStorageService.hashSetWithExpire({
        key: this.getThreadKey(threadId),
        field: messageId,
        value: JSON.stringify(messageBrowsingContext),
        ttlMs: BROWSING_CONTEXT_TTL_MILLISECONDS,
      });
    } catch (error) {
      this.logger.warn(
        `Could not store the browsing context of thread ${threadId}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  async recall({
    threadId,
    messageIds,
  }: {
    threadId: string;
    messageIds: string[];
  }): Promise<BrowsingContextType | null> {
    try {
      const browsingContextByMessageId = new Map(
        (
          await this.cacheStorageService.hashGetValues(
            this.getThreadKey(threadId),
          )
        )
          .map((value) => JSON.parse(value) as MessageBrowsingContext)
          .map(({ messageId, browsingContext }) => [
            messageId,
            browsingContext,
          ]),
      );

      const messageId = messageIds.find((candidateMessageId) =>
        browsingContextByMessageId.has(candidateMessageId),
      );

      return isDefined(messageId)
        ? (browsingContextByMessageId.get(messageId) ?? null)
        : null;
    } catch (error) {
      this.logger.warn(
        `Could not read the browsing context of thread ${threadId}: ${formatErrorWithCause(error)}`,
      );

      return null;
    }
  }
}
