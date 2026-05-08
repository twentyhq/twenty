import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatApplicationVariable = UniversalFlatEntityFrom<
  ApplicationVariableEntity,
  'applicationVariable'
>;
