import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const BROWSING_CONTEXT_TTL_MILLISECONDS = 86_400_000;

type BrowsingContextByMessageId = Record<string, BrowsingContextType>;

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
    browsingContext: BrowsingContextType | null;
  }): Promise<void> {
    if (!isDefined(browsingContext)) {
      return;
    }

    try {
      const browsingContextByMessageId =
        await this.cacheStorageService.get<BrowsingContextByMessageId>(
          this.getThreadKey(threadId),
        );

      await this.cacheStorageService.set<BrowsingContextByMessageId>(
        this.getThreadKey(threadId),
        { ...browsingContextByMessageId, [messageId]: browsingContext },
        BROWSING_CONTEXT_TTL_MILLISECONDS,
      );
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
      const browsingContextByMessageId =
        await this.cacheStorageService.get<BrowsingContextByMessageId>(
          this.getThreadKey(threadId),
        );

      const messageId = messageIds.find((candidateMessageId) =>
        isDefined(browsingContextByMessageId?.[candidateMessageId]),
      );

      return isDefined(messageId) && isDefined(browsingContextByMessageId)
        ? browsingContextByMessageId[messageId]
        : null;
    } catch (error) {
      this.logger.warn(
        `Could not read the browsing context of thread ${threadId}: ${formatErrorWithCause(error)}`,
      );

      return null;
    }
  }
}
