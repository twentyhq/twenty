/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/internal/record-share/utils/is-operation-granted-beyond-role.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';

// a scope bounds everything a run reaches, so shares never carry a scoped principal past its roles
export const isOperationGrantedBeyondRoleToPrincipals = ({
  principals,
  flatObjectMetadata,
  metadataMaps,
  operationType,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'flatObjectMetadata' | 'metadataMaps' | 'operationType'
>): boolean =>
  !isDefined(principals.runtimeLimitingRole) &&
  areLimitingRolesReachingAllRecords({
    principals,
    flatObjectMetadata,
    metadataMaps,
    operationType,
  }) &&
  isOperationGrantedBeyondRole({
    flatObjectMetadata,
    featureFlagsMap: metadataMaps.featureFlagsMap,
    operationType,
  });
