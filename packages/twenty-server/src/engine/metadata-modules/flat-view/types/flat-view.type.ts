import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export type FlatView = FlatEntityFrom<
  // TODO remove once viewSorts has been migrated to v2
  Omit<ViewEntity, 'viewSorts'>
>;
