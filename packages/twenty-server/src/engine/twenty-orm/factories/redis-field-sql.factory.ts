import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisFieldSqlFactory {
  constructor() {}

  buildZSetDateTimeParts(
    entries: { id: string; score: number }[],
    tableAlias: string,
    options: {
      cteName: string;
      idColumnName: string;
      valueColumnName: string;
    },
  ) {
    const joinOn = `"${options.cteName}"."${options.idColumnName}"::uuid = ${tableAlias}.id::uuid`;
    const selectExpr = `to_timestamp("${options.cteName}"."${options.valueColumnName}" / 1000)::timestamptz`;
    const values = entries
      .map(({ id, score }) => `('${id}', ${Number(score) || 0})`)
      .join(', ');

    return {
      joinOn,
      selectExpr,
      cteColumns: [options.idColumnName, options.valueColumnName],
      cteName: options.cteName,
      cteSql: `VALUES ${values}`,
    };
  }
}
