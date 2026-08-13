import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type ObjectWhereLike } from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';

export type MutationCriteria =
  | string
  | string[]
  | ObjectWhereLike
  | ObjectWhereLike[];

const isPlainObject = (value: unknown): value is ObjectWhereLike =>
  typeof value === 'object' &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype;

export const applyMutationCriteriaToQueryBuilder = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  criteria: MutationCriteria,
): WorkspaceSelectQueryBuilderV2 => {
  if (typeof criteria === 'string') {
    if (criteria.length === 0) {
      throw new TwentyOrmV2Exception(
        'A mutation criteria id cannot be an empty string',
        TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
      );
    }

    queryBuilder.where({ id: criteria });

    return queryBuilder;
  }

  if (Array.isArray(criteria)) {
    if (criteria.length === 0) {
      throw new TwentyOrmV2Exception(
        'A mutation criteria array cannot be empty',
        TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
      );
    }

    if (criteria.every((entry) => typeof entry === 'string')) {
      queryBuilder.where({ id: In(criteria) });

      return queryBuilder;
    }

    if (!criteria.every(isPlainObject)) {
      throw new TwentyOrmV2Exception(
        'A mutation criteria array must be all ids or all where objects',
        TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
      );
    }

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

  if (isDefined(criteria) && isPlainObject(criteria)) {
    queryBuilder.where(criteria);

    return queryBuilder;
  }

  throw new TwentyOrmV2Exception(
    'Unsupported mutation criteria',
    TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
  );
};
