import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatViewSort = UniversalFlatEntityFrom<
  ViewSortEntity,
  'viewSort'
>;
