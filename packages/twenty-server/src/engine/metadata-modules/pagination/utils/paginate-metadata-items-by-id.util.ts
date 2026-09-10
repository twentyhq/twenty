import { isDefined } from 'twenty-shared/utils';

import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';
import { buildMetadataCursorPage } from 'src/engine/metadata-modules/pagination/utils/build-metadata-cursor-page.util';

export const paginateMetadataItemsById = <TEntity extends { id: string }>({
  items,
  pagination,
}: {
  items: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const isBackwardPagination = pagination.direction === 'backward';
  // Cursors are accepted in any UUID casing, so they are compared against the
  // canonical lowercase ids the way a uuid column comparison would.
  const afterId = pagination.afterId?.toLowerCase();
  const beforeId = pagination.beforeId?.toLowerCase();
  const fetchedItems = items
    .filter(({ id }) => {
      if (isDefined(afterId)) {
        return id < afterId;
      }

      if (isDefined(beforeId)) {
        return id > beforeId;
      }

      return true;
    })
    .sort(({ id: firstId }, { id: secondId }) =>
      isBackwardPagination
        ? firstId.localeCompare(secondId)
        : secondId.localeCompare(firstId),
    )
    .slice(0, pagination.limit + 1);

  return buildMetadataCursorPage({ fetchedItems, pagination });
};
