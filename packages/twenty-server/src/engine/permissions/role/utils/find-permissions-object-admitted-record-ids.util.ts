/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/private-record/utils/find-record-ids-by-privacy.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/role/utils/are-role-grants-limited-to-public-records.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/rls/utils/resolve-permissions-row-level-permission-filter.util';

export const findPermissionsObjectAdmittedRecordIds = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[]> => {
  if (
    !isRolePermittingOperation(request) ||
    isDefined(
      resolvePermissionsRowLevelPermissionFilter({
        ...request,
        tableAlias: request.flatObjectMetadata.nameSingular,
      }),
    )
  ) {
    return [];
  }

  const recordIds = records.map((record) => record.id);

  return areRoleGrantsLimitedToPublicRecords(request)
    ? findRecordIdsByPrivacy({
        recordIds,
        flatObjectMetadata: request.flatObjectMetadata,
        context,
        isPrivate: false,
      })
    : recordIds;
};
