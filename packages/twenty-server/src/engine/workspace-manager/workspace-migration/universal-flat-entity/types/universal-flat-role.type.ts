import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRole = UniversalFlatEntityFrom<RoleEntity, 'role'>;
