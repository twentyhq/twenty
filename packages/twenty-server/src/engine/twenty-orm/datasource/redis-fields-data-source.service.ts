import { Injectable } from '@nestjs/common';

import type { Redis } from 'ioredis';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Injectable()
export class RedisFieldsDataSource {
  constructor(private readonly redisClientService: RedisClientService) {}

  getClient(): Redis {
    return this.redisClientService.getNoevictionClient();
  }

  async zrevrangeWithScores(
    key: string,
    start = 0,
    stop = -1,
  ): Promise<string[]> {
    const client = this.getClient() as unknown as {
      zrevrange: (
        key: string,
        start: number,
        stop: number,
        withscores: 'WITHSCORES',
      ) => Promise<string[]>;
    };

    return client.zrevrange(key, start, stop, 'WITHSCORES');
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const client = this.getClient() as unknown as {
      zadd: (key: string, score: number, member: string) => Promise<number>;
    };

    return client.zadd(key, score, member);
  }
}
