import { isDefined } from 'twenty-shared/utils';

import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import {
  type FindOptionsSelectLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';

export type FindOptionsV2 = {
  where?: ObjectWhereLike | ObjectWhereLike[];
  select?: FindOptionsSelectLike;
  order?: OrderByConditionLike;
  take?: number;
  skip?: number;
  withDeleted?: boolean;
  relations?: unknown;
};

// A `where` array is an OR of AND-groups, matching TypeORM's find semantics.
const applyWhere = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  where: ObjectWhereLike | ObjectWhereLike[],
): void => {
  const clauses = Array.isArray(where) ? where : [where];

  clauses.forEach((clause, index) => {
    if (index === 0) {
      queryBuilder.where(clause);
    } else {
      queryBuilder.orWhere(clause);
    }
  });
};

export const applyFindOptionsToQueryBuilder = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  options?: FindOptionsV2,
): WorkspaceSelectQueryBuilderV2 => {
  if (!isDefined(options)) {
    return queryBuilder;
  }

  if (isDefined(options.relations)) {
    throw new TwentyOrmV2Exception(
      'Loading relations through the ORM v2 find methods is not supported yet',
      TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
    );
  }

  if (options.withDeleted === true) {
    queryBuilder.withDeleted();
  }

  if (isDefined(options.select)) {
    queryBuilder.setFindOptions({ select: options.select });
  }

  if (isDefined(options.where)) {
    applyWhere(queryBuilder, options.where);
  }

  if (isDefined(options.order)) {
    queryBuilder.orderBy(options.order);
  }

  if (isDefined(options.take)) {
    queryBuilder.limit(options.take);
  }

  if (isDefined(options.skip)) {
    queryBuilder.offset(options.skip);
  }

  return queryBuilder;
};
