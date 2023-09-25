import { ObjectLiteral } from 'typeorm';

import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';

import { MergedOptions } from './default-options';

export function decodeCursor<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
>(
  connectionCursor: string | undefined,
  options: MergedOptions<Entity, Record, Cursor, Node, CustomEdge>,
): Cursor | undefined {
  if (!connectionCursor) {
    return undefined;
  }

  return options.decodeCursor(connectionCursor);
}

export function encodeCursor<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
>(
  record: Record,
  options: MergedOptions<Entity, Record, Cursor, Node, CustomEdge>,
): string {
  return options.encodeCursor(options.getCursor(record));
}

export function extractCursorKeyValue<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
>(
  connectionCursor: string | undefined,
  options: MergedOptions<Entity, Record, Cursor, Node, CustomEdge>,
): [string[], unknown[]] | undefined {
  const cursor = decodeCursor(connectionCursor, options);

  if (!cursor) {
    return undefined;
  }

  return [Object.keys(cursor), Object.values(cursor)];
}
