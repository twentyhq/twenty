import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

const BROWSING_CONTEXT_TTL_SECONDS = 86_400;

@Injectable()
export class AgentChatBrowsingContextService {
  private readonly logger = new Logger(AgentChatBrowsingContextService.name);

  constructor(private readonly redisClientService: RedisClientService) {}

  private getMessageKey(messageId: string): string {
    return `agent-chat-browsing-context:message:${messageId}`;
  }

  async remember({
    messageId,
    browsingContext,
  }: {
    messageId: string;
    browsingContext: BrowsingContextType | null;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(
        this.getMessageKey(messageId),
        JSON.stringify(browsingContext ?? null),
        'EX',
        BROWSING_CONTEXT_TTL_SECONDS,
      )
      .catch((error) => {
        this.logger.warn(
          `Could not store the browsing context of message ${messageId}: ${formatErrorWithCause(error)}`,
        );
      });
  }

  async recall({
    messageIds,
  }: {
    messageIds: string[];
  }): Promise<BrowsingContextType | null> {
    if (!isNonEmptyArray(messageIds)) {
      return null;
    }

    try {
      const serializedBrowsingContext = (
        await this.redisClientService
          .getClient()
          .mget(messageIds.map((messageId) => this.getMessageKey(messageId)))
      ).find(isDefined);

      return isDefined(serializedBrowsingContext)
        ? (JSON.parse(serializedBrowsingContext) as BrowsingContextType | null)
        : null;
    } catch (error) {
      this.logger.warn(
        `Could not read the browsing context of message ${messageIds[0]}: ${formatErrorWithCause(error)}`,
      );

      return null;
    }
  }
}
