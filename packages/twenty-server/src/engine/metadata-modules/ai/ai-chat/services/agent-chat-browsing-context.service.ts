import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const BROWSING_CONTEXT_TTL_SECONDS = 86_400;

@Injectable()
export class AgentChatBrowsingContextService {
  private readonly logger = new Logger(AgentChatBrowsingContextService.name);

  constructor(private readonly redisClientService: RedisClientService) {}

  private getThreadKey(threadId: string): string {
    return `agent-chat-browsing-context:thread:${threadId}`;
  }

  private getMessageKey(messageId: string): string {
    return `agent-chat-browsing-context:message:${messageId}`;
  }

  async remember({
    threadId,
    messageId,
    browsingContext,
  }: {
    threadId: string;
    messageId: string;
    browsingContext: BrowsingContextType;
  }): Promise<void> {
    const serializedBrowsingContext = JSON.stringify(browsingContext);

    await this.redisClientService
      .getClient()
      .multi()
      .set(
        this.getThreadKey(threadId),
        serializedBrowsingContext,
        'EX',
        BROWSING_CONTEXT_TTL_SECONDS,
      )
      .set(
        this.getMessageKey(messageId),
        serializedBrowsingContext,
        'EX',
        BROWSING_CONTEXT_TTL_SECONDS,
      )
      .exec()
      .catch((error) => {
        this.logger.warn(
          `Could not store the browsing context of thread ${threadId}: ${formatErrorWithCause(error)}`,
        );
      });
  }

  async recall({
    threadId,
    messageId,
  }: {
    threadId: string;
    messageId?: string;
  }): Promise<BrowsingContextType | null> {
    try {
      const client = this.redisClientService.getClient();
      const serializedBrowsingContext =
        (isDefined(messageId)
          ? await client.get(this.getMessageKey(messageId))
          : null) ?? (await client.get(this.getThreadKey(threadId)));

      return isDefined(serializedBrowsingContext)
        ? (JSON.parse(serializedBrowsingContext) as BrowsingContextType)
        : null;
    } catch (error) {
      this.logger.warn(
        `Could not read the browsing context of thread ${threadId}: ${formatErrorWithCause(error)}`,
      );

      return null;
    }
  }
}
