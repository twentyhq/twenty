import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';

export const fromFlatFieldPermissionToFieldPermissionDto = (
  flatFieldPermission: FlatFieldPermission,
): FieldPermissionDTO => ({
  id: flatFieldPermission.id,
  objectMetadataId: flatFieldPermission.objectMetadataId,
  fieldMetadataId: flatFieldPermission.fieldMetadataId,
  roleId: flatFieldPermission.roleId,
  canReadFieldValue: flatFieldPermission.canReadFieldValue ?? null,
  canUpdateFieldValue: flatFieldPermission.canUpdateFieldValue ?? null,
});
