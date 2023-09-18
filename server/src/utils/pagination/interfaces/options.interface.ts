import { GraphQLResolveInfo } from 'graphql';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { IEdge } from './edge.interface';

export interface IOptions<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
> {
  getRecords?: (args: SelectQueryBuilder<Entity>) => Promise<Record[]>;
  getCursor?: (record: Record) => Cursor;
  encodeCursor?: (cursor: Cursor) => string;
  decodeCursor?: (cursorString: string) => Cursor;
  recordToEdge?: (record: Record) => Omit<CustomEdge, 'cursor'>;
  resolveInfo?: GraphQLResolveInfo | null;
}
