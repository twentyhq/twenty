import { type ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatViewTab = UniversalFlatEntityFrom<
  ViewTabEntity,
  'viewTab'
>;
