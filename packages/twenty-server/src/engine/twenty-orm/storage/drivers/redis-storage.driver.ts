import { Injectable } from '@nestjs/common';

import { redisKeyBuilder } from 'src/engine/twenty-orm/utils/redis-key-builder.util';
import { RedisFieldRepository } from 'src/engine/twenty-orm/repository/redis-fields.repository';
import { RedisFieldSqlFactory } from 'src/engine/twenty-orm/factories/redis-field-sql.factory';

type RedisStorageDriverParams = {
  workspaceId: string;
  userId: string;
  objectMetadataId: string;
};

@Injectable()
export class RedisStorageDriver {
  constructor(
    private readonly redisFieldRepository: RedisFieldRepository,
    private readonly redisFieldSqlFactory: RedisFieldSqlFactory,
  ) {}

  async collectData(
    params: RedisStorageDriverParams,
    fieldName: string,
    tableAlias: string,
  ) {
    return this.buildSqlParts(params, fieldName, tableAlias);
  }

  private getEntries(params: RedisStorageDriverParams) {
    const key = redisKeyBuilder(params);

    return this.redisFieldRepository.getZSetEntriesRange({ key });
  }

  private async buildSqlParts(
    keyParams: RedisStorageDriverParams,
    fieldName: string,
    tableAlias: string,
  ) {
    const entries = await this.getEntries(keyParams);

    if (entries.length === 0) return;

    return this.redisFieldSqlFactory.buildZSetDateTimeParts(
      entries,
      tableAlias,
      {
        cteName: `${fieldName}Records`,
        idColumnName: 'recordId',
        valueColumnName: fieldName,
      },
    );
  }
}
