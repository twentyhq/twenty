import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

type ApplicationVariableUniversalFlatEntity = UniversalFlatEntityFrom<
  ApplicationVariableEntity,
  'applicationVariable'
>;

// Workspace-owned: manifests never carry it, the create action handler sets it
// Related to https://github.com/twentyhq/core-team-issues/issues/2934
export type UniversalFlatApplicationVariable = Omit<
  ApplicationVariableUniversalFlatEntity,
  'value'
> &
  Partial<Pick<ApplicationVariableUniversalFlatEntity, 'value'>>;
