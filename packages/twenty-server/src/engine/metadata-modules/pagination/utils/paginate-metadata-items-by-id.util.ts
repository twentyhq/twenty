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
  const fetchedItems = items
    .filter(({ id }) => {
      if (isDefined(pagination.afterId)) {
        return id < pagination.afterId;
      }

      if (isDefined(pagination.beforeId)) {
        return id > pagination.beforeId;
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
