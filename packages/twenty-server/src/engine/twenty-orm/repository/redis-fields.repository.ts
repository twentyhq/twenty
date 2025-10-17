import { Injectable } from '@nestjs/common';

import { RedisFieldsDataSource } from 'src/engine/twenty-orm/datasource/redis-fields-data-source.service';

@Injectable()
export class RedisFieldRepository {
  constructor(private readonly redisDs: RedisFieldsDataSource) {}

  async getZSetEntriesRange({
    key,
    start = 0,
    stop = -1,
  }: {
    key: string;
    start?: number;
    stop?: number;
  }): Promise<{ id: string; score: number }[]> {
    const raw = await this.redisDs.zrevrangeWithScores(key, start, stop);
    const out: { id: string; score: number }[] = [];

    for (let i = 0; i < raw.length; i += 2) {
      out.push({ id: raw[i] as string, score: Number(raw[i + 1]) || 0 });
    }

    return out;
  }

  async setZSetEntry({
    key,
    id,
    score,
  }: {
    key: string;
    id: string;
    score: number;
  }): Promise<void> {
    await this.redisDs.zadd(key, score, id);
  }
}
