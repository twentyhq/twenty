import { isDefined } from 'twenty-shared/utils';

import { encodeCursorData } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';

export const toCursorConnection = <TEntity extends { id: string }>({
  items,
  pageInfo,
}: MetadataCursorPage<TEntity>): CursorConnection<TEntity> => ({
  edges: items.map((node) => ({
    node,
    cursor: encodeCursorData({ id: node.id }),
  })),
  pageInfo: {
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: pageInfo.hasPreviousPage,
    startCursor: isDefined(pageInfo.startCursor)
      ? encodeCursorData({ id: pageInfo.startCursor })
      : null,
    endCursor: isDefined(pageInfo.endCursor)
      ? encodeCursorData({ id: pageInfo.endCursor })
      : null,
  },
});
