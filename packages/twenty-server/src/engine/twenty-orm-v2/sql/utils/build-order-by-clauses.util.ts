import { type OrderByClause } from 'src/engine/twenty-orm-v2/sql/utils/build-select-statement.util';
import { type OrderByConditionLike } from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';

export const buildOrderByClauses = ({
  orderByOrExpression,
  direction,
  nulls,
  normaliseColumnExpression,
}: {
  orderByOrExpression: OrderByConditionLike | string;
  direction: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
  normaliseColumnExpression: (expression: string) => string;
}): OrderByClause[] => {
  if (typeof orderByOrExpression === 'string') {
    return [
      {
        expression: normaliseColumnExpression(orderByOrExpression),
        direction,
        nulls,
      },
    ];
  }

  return Object.entries(orderByOrExpression).map(([expression, value]) => {
    const normalisedExpression = normaliseColumnExpression(expression);

    if (typeof value === 'string') {
      return { expression: normalisedExpression, direction: value };
    }

    return {
      expression: normalisedExpression,
      direction: value.order ?? 'ASC',
      nulls: value.nulls,
    };
  });
};
