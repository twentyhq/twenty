import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisFieldSqlFactory {
  buildZSetDateTimeParts(
    entries: { id: string; score: number }[],
    tableAlias: string,
    options?: {
      cteName?: string;
      idColumnName?: string;
      valueColumnName?: string;
    },
  ) {
    if (!entries.length) return null;

    const cteName = options?.cteName ?? 'redisFieldRecords';
    const idCol = options?.idColumnName ?? 'recordId';
    const valueCol = options?.valueColumnName ?? 'tsMs';

    if (!entries.length) return null;

    const values = entries
      .map(({ id, score }) => `('${id}', ${Number(score) || 0})`)
      .join(', ');

    const cte = {
      cteName,
      columns: [idCol, valueCol],
      cteSql: `VALUES ${values}`,
    };

    const joinOn = `rf."${idCol}"::uuid = ${tableAlias}.id::uuid`;
    const selectExpr = `to_timestamp(rf."${valueCol}" / 1000)::timestamptz`;

    return {
      cteName: cte.cteName,
      cteSql: cte.cteSql,
      cteColumns: cte.columns,
      joinOn,
      selectExpr,
    };
  }
}
