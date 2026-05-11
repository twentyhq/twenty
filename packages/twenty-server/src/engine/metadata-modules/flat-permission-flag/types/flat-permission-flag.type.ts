import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/entities/permission-flag.entity';

export type FlatPermissionFlag =
  FlatEntityFrom<PermissionFlagEntity>;
