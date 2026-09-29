import { In } from 'typeorm';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import {
  isObjectWhereLike,
  type ObjectWhereLike,
} from 'src/engine/twenty-orm/query-builder/types/query-builder.type';

export type MutationCriteria =
  | string
  | string[]
  | ObjectWhereLike
  | ObjectWhereLike[];

// A where object with no key filters nothing, so the mutation would reach
// every row of the table.
const assertWhereObjectFilters = (whereObject: ObjectWhereLike): void => {
  if (Object.keys(whereObject).length === 0) {
    throw new TwentyOrmException(
      'A mutation criteria where object cannot be empty',
      TwentyOrmExceptionCode.INVALID_PARAMETER,
    );
  }
};

export const applyMutationCriteriaToQueryBuilder = (
  queryBuilder: WorkspaceSelectQueryBuilder,
  criteria: MutationCriteria,
): WorkspaceSelectQueryBuilder => {
  if (typeof criteria === 'string') {
    if (criteria.length === 0) {
      throw new TwentyOrmException(
        'A mutation criteria id cannot be an empty string',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    queryBuilder.where({ id: criteria });

    return queryBuilder;
  }

  if (Array.isArray(criteria)) {
    if (criteria.length === 0) {
      throw new TwentyOrmException(
        'A mutation criteria array cannot be empty',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    if (criteria.every((entry) => typeof entry === 'string')) {
      queryBuilder.where({ id: In(criteria) });

      return queryBuilder;
    }

    if (!criteria.every(isObjectWhereLike)) {
      throw new TwentyOrmException(
        'A mutation criteria array must be all ids or all where objects',
        TwentyOrmExceptionCode.INVALID_PARAMETER,
      );
    }

    criteria.forEach(assertWhereObjectFilters);

    queryBuilder.where({
      whereFactory: (nestedQueryBuilder) => {
        criteria.forEach((entry, index) => {
          if (index === 0) {
            nestedQueryBuilder.where(entry);
          } else {
            nestedQueryBuilder.orWhere(entry);
          }
        });
      },
    });

    return queryBuilder;
  }

  assertWhereObjectFilters(criteria);

  queryBuilder.where(criteria);

  return queryBuilder;
};
