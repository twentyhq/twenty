import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatPermissionFlag = UniversalFlatEntityFrom<
  PermissionFlagEntity,
  'permissionFlag'
>;
