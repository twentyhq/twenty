import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export const fromFlatViewSortToViewSortDto = (
  flatViewSort: FlatViewSort,
): ViewSortDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatViewSort;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
