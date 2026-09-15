import { isDefined } from 'twenty-shared/utils';

import { buildCursorPage } from 'src/engine/api/utils/build-cursor-page.util';
import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';

export const buildMetadataCursorPage = <TEntity extends { id: string }>({
  fetchedItems,
  pagination,
}: {
  fetchedItems: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const { items, pageInfo } = buildCursorPage({
    fetchedItems,
    limit: pagination.limit,
    direction: pagination.direction,
    hasAfterCursor: isDefined(pagination.afterId),
    hasBeforeCursor: isDefined(pagination.beforeId),
  });

  return {
    items,
    pageInfo: {
      ...pageInfo,
      startCursor: items[0]?.id ?? null,
      endCursor: items[items.length - 1]?.id ?? null,
    },
  };
};
