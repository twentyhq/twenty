import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';

export const fromFlatViewFilterToViewFilterDto = (
  flatViewFilter: FlatViewFilter,
): ViewFilterDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatViewFilter;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
