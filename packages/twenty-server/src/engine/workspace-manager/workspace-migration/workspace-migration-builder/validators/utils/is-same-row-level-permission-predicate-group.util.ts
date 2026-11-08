import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';

export const isSameRowLevelPermissionPredicateGroup = ({
  fieldPermission,
  otherFieldPermission,
}: {
  fieldPermission: Pick<
    UniversalFlatFieldPermission,
    'rowLevelPermissionPredicateGroupUniversalIdentifier'
  >;
  otherFieldPermission: Pick<
    UniversalFlatFieldPermission,
    'rowLevelPermissionPredicateGroupUniversalIdentifier'
  >;
}): boolean =>
  (fieldPermission.rowLevelPermissionPredicateGroupUniversalIdentifier ??
    null) ===
  (otherFieldPermission.rowLevelPermissionPredicateGroupUniversalIdentifier ??
    null);
