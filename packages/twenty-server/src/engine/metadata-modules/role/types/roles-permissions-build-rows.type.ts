import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { type RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { type ComputeObjectRecordPermissionsArgs } from 'src/engine/metadata-modules/role/types/compute-object-record-permissions-args.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

type RowsByRoleId<TRow> = { byRoleId: Map<string, TRow[]> };

export type RolesPermissionsBuildRows = {
  role: (Pick<RoleEntity, 'id'> & ComputeObjectRecordPermissionsArgs['role'])[];
  objectPermission: RowsByRoleId<
    Pick<ObjectPermissionEntity, 'objectMetadataId'> &
      NonNullable<
        ComputeObjectRecordPermissionsArgs['objectPermissionOverride']
      >
  >;
  rolePermissionFlag: RowsByRoleId<
    Pick<RolePermissionFlagEntity, 'permissionFlagId'> &
      Partial<Pick<RolePermissionFlagEntity, 'flag'>>
  >;
  permissionFlag: Pick<PermissionFlagEntity, 'id' | 'universalIdentifier'>[];
  fieldPermission: RowsByRoleId<
    Pick<
      FieldPermissionEntity,
      | 'objectMetadataId'
      | 'fieldMetadataId'
      | 'canReadFieldValue'
      | 'canUpdateFieldValue'
    >
  >;
  rowLevelPermissionPredicate: RowsByRoleId<RowLevelPermissionPredicate>;
  rowLevelPermissionPredicateGroup: RowsByRoleId<RowLevelPermissionPredicateGroup>;
  objectMetadata: Pick<
    ObjectMetadataEntity,
    'id' | 'isSystem' | 'universalIdentifier' | 'labelIdentifierFieldMetadataId'
  >[];
};
