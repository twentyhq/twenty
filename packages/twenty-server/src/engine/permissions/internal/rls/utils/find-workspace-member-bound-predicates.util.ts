/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

type WorkspaceMemberBoundPredicate = RowLevelPermissionPredicate & {
  workspaceMemberFieldMetadataId: string;
};

export const findWorkspaceMemberBoundPredicates = (
  rolesPermissions: Record<string, RoleRecordsPermissions>,
): WorkspaceMemberBoundPredicate[] =>
  Object.values(rolesPermissions).flatMap(({ objects }) =>
    Object.values(objects).flatMap((objectRecordsPermissions) =>
      (objectRecordsPermissions?.rowLevelRecordsPermissions ?? []).flatMap(
        ({ predicates }) =>
          predicates.filter(
            (predicate): predicate is WorkspaceMemberBoundPredicate =>
              isDefined(predicate.workspaceMemberFieldMetadataId),
          ),
      ),
    ),
  );
