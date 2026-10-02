import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export type ComputeObjectRecordPermissionsArgs = {
  role: Pick<
    RoleEntity,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
  >;
  rolePermissionFlagUniversalIdentifiers: ReadonlySet<string>;
  objectMetadata: Pick<
    ObjectMetadataEntity,
    'isSystem' | 'universalIdentifier'
  >;
  objectPermissionOverride?: Pick<
    ObjectPermissionEntity,
    | 'canReadObjectRecords'
    | 'canUpdateObjectRecords'
    | 'canSoftDeleteObjectRecords'
    | 'canDestroyObjectRecords'
  >;
};
