/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const findWorkspaceMemberRelationPredicates = (
  rolesPermissions: Record<string, RoleRecordsPermissions>,
): RowLevelPermissionPredicate[] => {
  const predicateByMemberFieldKey = new Map<
    string,
    RowLevelPermissionPredicate
  >();

  for (const { objects } of Object.values(rolesPermissions)) {
    for (const objectRecordsPermissions of Object.values(objects)) {
      for (const {
        predicates,
      } of objectRecordsPermissions?.rowLevelRecordsPermissions ?? []) {
        for (const predicate of predicates) {
          if (
            isDefined(predicate.workspaceMemberRelationFieldMetadataId) &&
            isDefined(predicate.workspaceMemberFieldMetadataId)
          ) {
            predicateByMemberFieldKey.set(
              buildMemberFieldKey(predicate),
              predicate,
            );
          }
        }
      }
    }
  }

  return [...predicateByMemberFieldKey.values()];
};
