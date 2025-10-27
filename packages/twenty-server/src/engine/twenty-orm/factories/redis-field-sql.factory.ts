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
    const selectExpr = `"${options.cteName}"."${options.valueColumnName}"`;
    const values = entries
      .map(
        ({ id, score }) =>
          `('${id}', to_timestamp(${Number(score) || 0} / 1000)::timestamptz)`,
      )
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
