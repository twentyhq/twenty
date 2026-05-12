import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type PermissionFlagGrantEntity } from 'src/engine/metadata-modules/permission-flag-grant/permission-flag-grant.entity';

export type FlatPermissionFlagGrant = FlatEntityFrom<PermissionFlagGrantEntity>;
