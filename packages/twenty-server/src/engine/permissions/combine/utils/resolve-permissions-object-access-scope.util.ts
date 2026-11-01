/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessScope } from 'src/engine/permissions/combine/types/permissions-object-access-scope.type';
import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { buildPermissionsObjectCondition } from 'src/engine/permissions/role/utils/build-permissions-object-condition.util';

export const resolvePermissionsObjectAccessScope = (
  request: PermissionsRowAccessRequest,
): PermissionsObjectAccessScope => {
  const outcome = resolvePermissionsRowAccessOutcome(request);

  if (isDefined(outcome)) {
    return outcome ? 'all' : 'none';
  }

  return buildPermissionsObjectCondition({
    ...request,
    tableAlias: request.flatObjectMetadata.nameSingular,
  }) === true
    ? 'all'
    : 'gated';
};
