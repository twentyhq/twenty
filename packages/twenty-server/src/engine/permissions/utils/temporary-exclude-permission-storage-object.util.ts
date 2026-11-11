import { PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/constants/permission-storage-object-universal-identifiers.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// TODO(@charlesBochet): remove with IS_PERMISSION_SYSTEM_TABLES_ENABLED, once recordShare
// and accessGroup are no longer objects on any workspace
export const temporaryExcludePermissionStorageObject = (
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier,
  );
