import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatViewField = UniversalFlatEntityFrom<
  ViewFieldEntity,
  'viewField'
>;
