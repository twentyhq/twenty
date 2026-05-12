import { type PermissionFlagGrantEntity } from 'src/engine/metadata-modules/permission-flag-grant/permission-flag-grant.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatPermissionFlagGrant = UniversalFlatEntityFrom<
  PermissionFlagGrantEntity,
  'permissionFlagGrant'
>;
