import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';

export type FlatApplicationVariable = FlatEntityFrom<ApplicationVariableEntity>;
