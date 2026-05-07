import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';

export type FlatPermissionFlagDefinition =
  FlatEntityFrom<PermissionFlagDefinitionEntity>;
