import { isDefined } from 'twenty-shared/utils';

import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';
import { buildMetadataCursorPage } from 'src/engine/metadata-modules/pagination/utils/build-metadata-cursor-page.util';

// Some metadata collections have meaningful domain ordering (for example view
// fields by position). Their cursor is an identity marker within that stable
// ordered result, not a sortable key.
export const paginateMetadataOrderedItems = <TEntity extends { id: string }>({
  items,
  pagination,
}: {
  items: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const cursorId = pagination.afterId ?? pagination.beforeId;
  // Cursors are accepted in any UUID casing, so identity is matched
  // case-insensitively against the canonical lowercase ids.
  const normalizedCursorId = cursorId?.toLowerCase();
  const cursorIndex = isDefined(normalizedCursorId)
    ? items.findIndex(({ id }) => id.toLowerCase() === normalizedCursorId)
    : undefined;

  if (cursorIndex === -1) {
    return buildMetadataCursorPage({ fetchedItems: [], pagination });
  }

  const fetchedItems =
    pagination.direction === 'backward'
      ? items
          .slice(0, cursorIndex ?? items.length)
          .reverse()
          .slice(0, pagination.limit + 1)
      : items.slice(
          (cursorIndex ?? -1) + 1,
          (cursorIndex ?? -1) + pagination.limit + 2,
        );

  return buildMetadataCursorPage({ fetchedItems, pagination });
};
