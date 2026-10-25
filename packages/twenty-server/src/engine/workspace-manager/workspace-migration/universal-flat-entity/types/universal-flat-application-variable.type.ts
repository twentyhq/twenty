import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

type ApplicationVariableUniversalFlatEntity = UniversalFlatEntityFrom<
  ApplicationVariableEntity,
  'applicationVariable'
>;

// The value belongs to the workspace, not the definition: a manifest never
// carries it and the create action handler initializes it
// Related to https://github.com/twentyhq/core-team-issues/issues/2934
export type UniversalFlatApplicationVariable = Omit<
  ApplicationVariableUniversalFlatEntity,
  'value'
> &
  Partial<Pick<ApplicationVariableUniversalFlatEntity, 'value'>>;
