import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import {
  type FindOptionsSelectLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';

export type FindOptionsRelationsV2 = Record<string, boolean | object>;

export type FindOptionsSelectV2 = FindOptionsSelectLike | string[];

export type FindOptionsV2 = {
  where?: ObjectWhereLike | ObjectWhereLike[];
  select?: FindOptionsSelectV2;
  order?: OrderByConditionLike;
  take?: number;
  skip?: number;
  withDeleted?: boolean;
  relations?: FindOptionsRelationsV2;
};

const normalizeSelect = (select: FindOptionsSelectV2): FindOptionsSelectLike =>
  Array.isArray(select)
    ? Object.fromEntries(select.map((columnName) => [columnName, true]))
    : select;

// A `where` array is an OR of AND-groups, matching TypeORM's find semantics. It
// is wrapped in a single bracketed group so a later ANDed predicate (e.g. the
// row-level permission filter) applies to the whole disjunction, not just the
// first branch.
const applyWhere = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  where: ObjectWhereLike | ObjectWhereLike[],
): void => {
  if (!Array.isArray(where)) {
    queryBuilder.where(where);

    return;
  }

  if (where.length === 1) {
    queryBuilder.where(where[0]);

    return;
  }

  queryBuilder.where({
    whereFactory: (nestedQueryBuilder) => {
      where.forEach((clause, index) => {
        if (index === 0) {
          nestedQueryBuilder.where(clause);
        } else {
          nestedQueryBuilder.orWhere(clause);
        }
      });
    },
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
  if (options.withDeleted) {
    queryBuilder.withDeleted();
  }

  if (isDefined(options.select)) {
    queryBuilder.setFindOptions({ select: normalizeSelect(options.select) });
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
