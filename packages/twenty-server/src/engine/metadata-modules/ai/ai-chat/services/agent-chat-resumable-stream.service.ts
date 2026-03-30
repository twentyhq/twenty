import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Readable } from 'stream';
import { type ReadableStream as NodeWebReadableStream } from 'stream/web';

import type { Redis } from 'ioredis';
import { createResumableStreamContext } from 'resumable-stream/ioredis';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class AgentChatResumableStreamService implements OnModuleDestroy {
  private streamContext: ReturnType<typeof createResumableStreamContext>;
  private publisher: Redis;
  private subscriber: Redis;

  constructor(private readonly redisClientService: RedisClientService) {
    const redisClient = this.redisClientService.getClient();

    this.publisher = redisClient.duplicate();
    this.subscriber = redisClient.duplicate();

    // In a long-running NestJS server (unlike serverless), the process
    // stays alive, so waitUntil just needs to let the promise settle.
    this.streamContext = createResumableStreamContext({
      waitUntil: () => {},
      publisher: this.publisher,
      subscriber: this.subscriber,
    });
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async createResumableStream(
    streamId: string,
    streamFactory: () => ReadableStream<string>,
  ) {
    await this.streamContext.createNewResumableStream(streamId, streamFactory);
  }

  async resumeExistingStreamAsNodeReadable(
    streamId: string,
  ): Promise<Readable | null> {
    const webStream = await this.streamContext.resumeExistingStream(streamId);

    if (!webStream) {
      return null;
    }

    return Readable.fromWeb(webStream as NodeWebReadableStream);
  }
}
