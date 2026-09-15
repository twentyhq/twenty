import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

const CLAIM_TTL_SECONDS = 600;
const RUNNING_TTL_SECONDS = 30;
const REFRESH_INTERVAL_MS = 5_000;

@Injectable()
export class AgentChatStreamHeartbeatService {
  constructor(private readonly redisClientService: RedisClientService) {}

  private getKey(streamId: string): string {
    return `agent-chat-stream-alive:${streamId}`;
  }

  async markClaimed(streamId: string): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(this.getKey(streamId), '1', 'EX', CLAIM_TTL_SECONDS);
  }

  startRunning(streamId: string): () => void {
    const refresh = () => {
      this.redisClientService
        .getClient()
        .set(this.getKey(streamId), '1', 'EX', RUNNING_TTL_SECONDS)
        .catch(() => {});
    };

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }

  async isAlive(streamId: string): Promise<boolean> {
    try {
      const exists = await this.redisClientService
        .getClient()
        .exists(this.getKey(streamId));

      return exists === 1;
    } catch {
      return true;
    }
  }

  async clear(streamId: string): Promise<void> {
    await this.redisClientService
      .getClient()
      .del(this.getKey(streamId))
      .catch(() => {});
  }
}
