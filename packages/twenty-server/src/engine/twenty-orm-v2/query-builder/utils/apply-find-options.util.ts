import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import {
  type FindOptionsSelectLike,
  type ObjectWhereLike,
  type OrderByConditionLike,
  type OrderByValueLike,
} from 'src/engine/twenty-orm-v2/query-builder/types/query-builder-v2.type';
import { type ToManyDedupOrder } from 'src/engine/twenty-orm-v2/sql/utils/build-select-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

export type FindOptionsRelationsV2 = {
  [relationFieldName: string]: boolean | FindOptionsRelationsV2;
};

export type FindOptionsSelectV2 = FindOptionsSelectLike | string[];

// An order entry keyed by a relation field carries the column orders of the
// related records, as TypeORM's nested find order does.
export type FindOptionsOrderV2 = {
  [key: string]: OrderByValueLike | OrderByConditionLike;
};

export type FindOptionsV2 = {
  where?: ObjectWhereLike | ObjectWhereLike[];
  select?: FindOptionsSelectV2;
  order?: FindOptionsOrderV2;
  take?: number;
  skip?: number;
  withDeleted?: boolean;
  relations?: FindOptionsRelationsV2 | string[];
};

// TypeORM also accepts relations as an array of possibly dotted paths, e.g.
// ['messages', 'messages.messageParticipants'].
export const normalizeFindOptionsRelations = (
  relations: FindOptionsRelationsV2 | string[],
): FindOptionsRelationsV2 => {
  if (!Array.isArray(relations)) {
    return relations;
  }

  const normalized: FindOptionsRelationsV2 = {};

  for (const relationPath of relations) {
    let currentLevel = normalized;

    for (const fieldName of relationPath.split('.')) {
      const existing = currentLevel[fieldName];
      const nested = typeof existing === 'object' ? existing : {};

      currentLevel[fieldName] = nested;
      currentLevel = nested;
    }
  }

  return normalized;
};

const normalizeSelect = (select: FindOptionsSelectV2): FindOptionsSelectLike =>
  Array.isArray(select)
    ? Object.fromEntries(select.map((columnName) => [columnName, true]))
    : select;

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

const isRelationOrderValue = (value: unknown): value is OrderByConditionLike =>
  isDefined(value) &&
  typeof value === 'object' &&
  !('order' in value) &&
  !('nulls' in value);

const isRelationOrderEntry = (
  tableShape: WorkspaceTableShape,
  key: string,
  value: OrderByValueLike | OrderByConditionLike,
): value is OrderByConditionLike =>
  isDefined(tableShape.relationShapeByFieldName[key]) &&
  isRelationOrderValue(value);

// An order entry keyed by a relation field orders parents through the relation
// and sorts the loaded child records; every other entry is a plain column order.
export const splitFindOptionsOrder = (
  tableShape: WorkspaceTableShape,
  order?: FindOptionsOrderV2,
): {
  columnOrder: OrderByConditionLike;
  orderByRelationFieldName: Record<string, OrderByConditionLike>;
} => {
  const columnOrder: OrderByConditionLike = {};
  const orderByRelationFieldName: Record<string, OrderByConditionLike> = {};

  for (const [key, value] of Object.entries(order ?? {})) {
    if (isRelationOrderEntry(tableShape, key, value)) {
      orderByRelationFieldName[key] = value;
      continue;
    }

    columnOrder[key] = value as OrderByValueLike;
  }

  return { columnOrder, orderByRelationFieldName };
};

const toDedupOrder = (order: OrderByConditionLike): ToManyDedupOrder[] =>
  Object.entries(order).map(([columnName, value]) => ({
    columnName,
    direction: typeof value === 'string' ? value : (value.order ?? 'ASC'),
    nulls: typeof value === 'string' ? undefined : value.nulls,
  }));

const applyRelationOrderEntry = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  relationFieldName: string,
  relationOrder: OrderByConditionLike,
): void => {
  queryBuilder.leftJoin(
    `${queryBuilder.alias}.${relationFieldName}`,
    relationFieldName,
    undefined,
    {
      allowToManyJoin: true,
      toManyDedupOrder: toDedupOrder(relationOrder),
    },
  );

  for (const [columnName, value] of Object.entries(relationOrder)) {
    if (typeof value === 'string') {
      queryBuilder.addOrderBy(`${relationFieldName}.${columnName}`, value);
      continue;
    }

    queryBuilder.addOrderBy(
      `${relationFieldName}.${columnName}`,
      value.order ?? 'ASC',
      value.nulls,
    );
  }
};

const applyOrder = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  order: FindOptionsOrderV2,
): void => {
  for (const [key, value] of Object.entries(order)) {
    if (isRelationOrderEntry(queryBuilder.tableShape, key, value)) {
      applyRelationOrderEntry(queryBuilder, key, value);
      continue;
    }

    queryBuilder.addOrderBy(
      ...toOrderByArguments(key, value as OrderByValueLike),
    );
  }
};

const toOrderByArguments = (
  key: string,
  value: OrderByValueLike,
): [string, 'ASC' | 'DESC', ('NULLS FIRST' | 'NULLS LAST')?] =>
  typeof value === 'string'
    ? [key, value, undefined]
    : [key, value.order ?? 'ASC', value.nulls];

export const applyFindOptionsToQueryBuilder = (
  queryBuilder: WorkspaceSelectQueryBuilderV2,
  options?: FindOptionsV2,
): WorkspaceSelectQueryBuilderV2 => {
  if (!isDefined(options)) {
    return queryBuilder;
  }

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
    applyOrder(queryBuilder, options.order);
  }

  if (isDefined(options.take)) {
    queryBuilder.limit(options.take);
  }

  if (isDefined(options.skip)) {
    queryBuilder.offset(options.skip);
  }

  return queryBuilder;
};
