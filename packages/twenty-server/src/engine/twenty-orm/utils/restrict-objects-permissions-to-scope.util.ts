import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mergeRestrictedFieldPermissions } from 'src/engine/metadata-modules/role/utils/merge-restricted-field-permissions.util';
import { type PermissionScope } from 'src/engine/twenty-orm/types/permission-scope.type';

// Not one more role of the intersection: a scope has no row-level predicates, and the intersection
// keeps a predicate only when every role constrains its field, so it would drop the roles' predicates
export const restrictObjectsPermissionsToScope = ({
  objectsPermissions,
  scope,
}: {
  objectsPermissions: ObjectsPermissions;
  scope: PermissionScope;
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
