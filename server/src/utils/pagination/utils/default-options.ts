import { ObjectLiteral } from 'typeorm';

import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { IOptions } from 'src/utils/pagination/interfaces/options.interface';

export type MergedOptions<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
> = Required<IOptions<Entity, Record, Cursor, Node, CustomEdge>>;

export function mergeDefaultOptions<
  Entity extends ObjectLiteral,
  Record,
  Cursor,
  Node,
  CustomEdge extends IEdge<Node>,
>(
  pOptions?: IOptions<Entity, Record, Cursor, Node, CustomEdge>,
): MergedOptions<Entity, Record, Cursor, Node, CustomEdge> {
  return {
    getRecords: async (query) => {
      return query.getRawMany();
    },
    getCursor: (record: Record) =>
      ({ id: (record as unknown as { id: string }).id } as unknown as Cursor),
    encodeCursor: (cursor: Cursor) =>
      Buffer.from((cursor as unknown as { id: string }).id.toString()).toString(
        'base64',
      ),
    decodeCursor: (cursorString: string) =>
      ({
        id: Buffer.from(cursorString, 'base64').toString(),
      } as unknown as Cursor),
    recordToEdge: (record: Record) =>
      ({ node: record } as unknown as Omit<CustomEdge, 'cursor'>),
    resolveInfo: null,
    ...pOptions,
  };
}
