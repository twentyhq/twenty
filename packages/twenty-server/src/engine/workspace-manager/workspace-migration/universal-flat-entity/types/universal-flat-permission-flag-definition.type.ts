import { type PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatPermissionFlagDefinition = UniversalFlatEntityFrom<
  PermissionFlagDefinitionEntity,
  'permissionFlagDefinition'
>;
