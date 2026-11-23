import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';

export const filterFieldPermissionsOfInput = ({
  fieldPermissions,
  input,
}: {
  fieldPermissions: FlatFieldPermission[];
  input: Pick<UpsertFieldPermissionsInput, 'fieldPermissions'>;
}): FlatFieldPermission[] => {
  const inputScopes = new Set(
    input.fieldPermissions.map(
      ({ objectMetadataId, rowLevelPermissionPredicateGroupId }) =>
        `${objectMetadataId}:${rowLevelPermissionPredicateGroupId ?? ''}`,
    ),
  );

  return fieldPermissions.filter(
    ({ objectMetadataId, rowLevelPermissionPredicateGroupId }) =>
      inputScopes.has(
        `${objectMetadataId}:${rowLevelPermissionPredicateGroupId ?? ''}`,
      ),
  );
};
