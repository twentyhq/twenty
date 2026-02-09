import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

// TODO remove once viewSorts has been migrated to v2
export type UniversalFlatView = UniversalFlatEntityFrom<
  Omit<ViewEntity, 'viewSorts'>,
  'view'
>;
