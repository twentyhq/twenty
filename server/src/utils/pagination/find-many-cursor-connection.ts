import {
  LessThanOrEqual,
  MoreThanOrEqual,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { IEdge } from './interfaces/edge.interface';
import { IConnectionArguments } from './interfaces/connection-arguments.interface';
import { IOptions } from './interfaces/options.interface';
import { IConnection } from './interfaces/connection.interface';
import { validateArgs } from './utils/validate-args';
import { mergeDefaultOptions } from './utils/default-options';
import {
  isBackwardPagination,
  isForwardPagination,
} from './utils/pagination-direction';
import { encodeCursor, extractCursorKeyValue } from './utils/cursor';

/**
 * Override cursors options
 */
export async function findManyCursorConnection<
  Entity extends ObjectLiteral,
  Record = Entity,
  Cursor = { id: string },
  Node = Record,
  CustomEdge extends IEdge<Node> = IEdge<Node>,
>(
  query: SelectQueryBuilder<Entity>,
  args: IConnectionArguments = {},
  initialOptions?: IOptions<Entity, Record, Cursor, Node, CustomEdge>,
): Promise<IConnection<Node, CustomEdge>> {
  if (!validateArgs(args)) {
    throw new Error('Should never happen');
  }

  const options = mergeDefaultOptions(initialOptions);
  const totalCountQuery = query.clone();
  const totalCount = await totalCountQuery.getCount();
  // Only to extract cursor shape
  const cursorKeys = Object.keys(options.getCursor(undefined) as any);

  let records: Array<Record>;
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  // Add order by based on the cursor keys
  for (const key of cursorKeys) {
    query.addOrderBy(key, 'ASC');
  }

  if (isForwardPagination(args)) {
    // Fetch one additional record to determine if there is a next page
    const take = args.first + 1;

    // Extract cursor map based on the encoded cursor
    const cursorMap = extractCursorKeyValue(args.after, options);
    const skip = cursorMap ? 1 : undefined;

    if (cursorMap) {
      const [keys, values] = cursorMap;

      // Add `cursor` filter in where condition
      query.andWhere(
        keys.reduce((acc, key, index) => {
          return {
            ...acc,
            [key]: MoreThanOrEqual(values[index]),
          };
        }, {}),
      );
    }

    // Add `take` and `skip` to the query
    query.take(take).skip(skip);

    // Fetch records
    records = await options.getRecords(query);

    // See if we are "after" another record, indicating a previous page
    hasPreviousPage = !!args.after;

    // See if we have an additional record, indicating a next page
    hasNextPage = records.length > args.first;

    // Remove the extra record (last element) from the results
    if (hasNextPage) records.pop();
  } else if (isBackwardPagination(args)) {
    // Fetch one additional record to determine if there is a previous page
    const take = -1 * (args.last + 1);

    // Extract cursor map based on the encoded cursor
    const cursorMap = extractCursorKeyValue(args.before, options);
    const skip = cursorMap ? 1 : undefined;

    if (cursorMap) {
      const [keys, values] = cursorMap;

      // Add `cursor` filter in where condition
      query.andWhere(
        keys.reduce((acc, key, index) => {
          return {
            ...acc,
            [key]: LessThanOrEqual(values[index]),
          };
        }, {}),
      );
    }

    // Add `take` and `skip` to the query
    query.take(take).skip(skip);

    // Fetch records
    records = await options.getRecords(query);

    // See if we are "before" another record, indicating a next page
    hasNextPage = !!args.before;

    // See if we have an additional record, indicating a previous page
    hasPreviousPage = records.length > args.last;

    // Remove the extra record (first element) from the results
    if (hasPreviousPage) records.shift();
  } else {
    // Fetch records
    records = await options.getRecords(query);

    hasNextPage = false;
    hasPreviousPage = false;
  }

  // The cursors are always the first & last elements of the result set
  const startCursor =
    records.length > 0 ? encodeCursor(records[0], options) : undefined;
  const endCursor =
    records.length > 0
      ? encodeCursor(records[records.length - 1], options)
      : undefined;

  // Allow the recordToEdge function to return a custom edge type which will be inferred
  type EdgeExtended = typeof options.recordToEdge extends (
    record: Record,
  ) => infer X
    ? X extends CustomEdge
      ? X & { cursor: string }
      : CustomEdge
    : CustomEdge;

  const edges = records.map((record) => {
    return {
      ...options.recordToEdge(record),
      cursor: encodeCursor(record, options),
    } as EdgeExtended;
  });

  return {
    edges,
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
    totalCount,
  };
}
