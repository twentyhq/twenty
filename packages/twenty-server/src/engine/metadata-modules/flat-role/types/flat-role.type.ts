import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type RoleEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<RoleEntity>;

export type FlatRole = FlatEntityFrom<
  RoleEntity,
  RoleEntityRelationProperties
> & {
  roleTargetIds: string[];
  objectPermissionIds: string[];
  permissionFlagIds: string[];
  fieldPermissionIds: string[];
};
