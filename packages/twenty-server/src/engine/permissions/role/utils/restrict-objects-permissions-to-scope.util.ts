import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mergeRestrictedFieldPermissions } from 'src/engine/metadata-modules/role/utils/merge-restricted-field-permissions.util';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

// not one more intersected role, which would drop the roles' row-level predicates
export const restrictObjectsPermissionsToScope = ({
  objectsPermissions,
  scope,
}: {
  objectsPermissions: ObjectsPermissions;
  scope: Pick<PermissionScope, 'objectsPermissions'>;
}): ObjectsPermissions =>
  Object.fromEntries(
    Object.entries(objectsPermissions).map(
      ([objectMetadataId, objectPermissions]) => {
        const scopeObjectPermissions =
          scope.objectsPermissions[objectMetadataId];

        if (!isDefined(scopeObjectPermissions)) {
          return [
            objectMetadataId,
            {
              ...objectPermissions,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ];
        }

        const restrictedFields = { ...objectPermissions.restrictedFields };

        for (const [fieldMetadataId, scopeRestriction] of Object.entries(
          scopeObjectPermissions.restrictedFields,
        )) {
          restrictedFields[fieldMetadataId] = mergeRestrictedFieldPermissions({
            existing: restrictedFields[fieldMetadataId],
            incoming: scopeRestriction,
          });
        }

        return [
          objectMetadataId,
          {
            ...objectPermissions,
            canReadObjectRecords:
              objectPermissions.canReadObjectRecords &&
              scopeObjectPermissions.canReadObjectRecords,
            canUpdateObjectRecords:
              objectPermissions.canUpdateObjectRecords &&
              scopeObjectPermissions.canUpdateObjectRecords,
            canSoftDeleteObjectRecords:
              objectPermissions.canSoftDeleteObjectRecords &&
              scopeObjectPermissions.canSoftDeleteObjectRecords,
            canDestroyObjectRecords:
              objectPermissions.canDestroyObjectRecords &&
              scopeObjectPermissions.canDestroyObjectRecords,
            restrictedFields,
          },
        ];
      },
    ),
  );
