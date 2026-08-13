import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import {
  type FindOptionsSelectLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';

export type FindOptionsRelationsV2 = Record<string, boolean | object>;

export type FindOptionsV2 = {
  where?: ObjectWhereLike | ObjectWhereLike[];
  select?: FindOptionsSelectLike;
  order?: OrderByConditionLike;
  take?: number;
  skip?: number;
  withDeleted?: boolean;
  relations?: FindOptionsRelationsV2;
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

  // `relations` are loaded by the repository after the base rows are fetched,
  // never rendered into this base query.
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
