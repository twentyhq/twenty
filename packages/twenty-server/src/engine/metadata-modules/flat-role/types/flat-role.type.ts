import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { type RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RoleEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    RoleEntity,
    | RoleTargetsEntity
    | ObjectPermissionEntity
    | PermissionFlagEntity
    | FieldPermissionEntity
    | ApplicationEntity
  >;

export type FlatRole = FlatEntityFrom<
  RoleEntity,
  RoleEntityRelationProperties
> & {
  roleTargetIds: string[];
  objectPermissionIds: string[];
  permissionFlagIds: string[];
  fieldPermissionIds: string[];
};
