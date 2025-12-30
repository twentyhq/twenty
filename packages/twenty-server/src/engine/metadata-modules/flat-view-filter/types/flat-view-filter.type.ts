import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';

export type FlatViewFilter = FlatEntityFrom<
  // TODO remove once viewFilterGroups have been migrated to v2
  Omit<ViewFilterEntity, 'viewFilterGroup'>
>;
