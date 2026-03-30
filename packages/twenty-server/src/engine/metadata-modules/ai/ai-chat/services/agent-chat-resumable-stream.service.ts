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
    const resumableStream = await this.streamContext.createNewResumableStream(
      streamId,
      streamFactory,
    );

    if (!resumableStream) {
      return;
    }

    // Read the stream to completion in the background so chunks are
    // published to Redis and available for later resume consumers.
    const reader = resumableStream.getReader();

    void (async () => {
      try {
        while (true) {
          const { done } = await reader.read();

          if (done) {
            break;
          }
        }
      } catch {
        // Stream interrupted — chunks already published are still resumable.
      }
    })();
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

  async writeStreamError(
    streamId: string,
    error: { code: string; message: string },
  ): Promise<void> {
    await this.publisher.set(
      `ai-stream:error:${streamId}`,
      JSON.stringify(error),
      'EX',
      60,
    );
  }

  async readStreamError(
    streamId: string,
  ): Promise<{ code: string; message: string } | null> {
    const raw = await this.publisher.get(`ai-stream:error:${streamId}`);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  }
}
