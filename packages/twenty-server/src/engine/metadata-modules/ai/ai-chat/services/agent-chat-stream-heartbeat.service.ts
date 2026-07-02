import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

// Covers the window between enqueue and job pickup: BullMQ may hold the job
// queued for a while under backlog, so the claim-time TTL matches the job
// lock horizon rather than the running-refresh cadence.
const CLAIM_TTL_SECONDS = 600;
const RUNNING_TTL_SECONDS = 60;
const REFRESH_INTERVAL_MS = 15_000;

@Injectable()
export class AgentChatStreamHeartbeatService {
  constructor(private readonly redisClientService: RedisClientService) {}

  private getKey(streamId: string): string {
    return `agent-chat-stream-alive:${streamId}`;
  }

  // Called by every enqueue site right after it claims the thread.
  async markClaimed(streamId: string): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(this.getKey(streamId), '1', 'EX', CLAIM_TTL_SECONDS);
  }

  // Called by the job on pickup; the returned stop function must run in the
  // job's finally. If the worker dies, the interval dies with it and the key
  // expires — that expiry is what the reaper detects.
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
    const exists = await this.redisClientService
      .getClient()
      .exists(this.getKey(streamId));

    return exists === 1;
  }

  async clear(streamId: string): Promise<void> {
    await this.redisClientService
      .getClient()
      .del(this.getKey(streamId))
      .catch(() => {});
  }
}
