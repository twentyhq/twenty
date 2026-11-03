/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildPermissionsGrantCondition } from 'src/engine/permissions/combine/utils/build-permissions-grant-condition.util';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { getObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/utils/get-object-row-access-policy.util';

export const buildPermissionsCondition = ({
  tableAlias,
  ...request
}: Omit<PermissionsRowAccessSqlRequest, 'tableAlias'> & {
  tableAlias?: string;
}): SqlCondition | boolean => {
  const sqlRequest = {
    ...request,
    tableAlias: tableAlias ?? request.flatObjectMetadata.nameSingular,
  };
  const grantCondition = buildPermissionsGrantCondition(sqlRequest);

  if (grantCondition === false) {
    return false;
  }

  const objectPolicyCondition = getObjectRowAccessPolicy(
    request.flatObjectMetadata,
  )?.buildCondition(sqlRequest);

  if (!isDefined(objectPolicyCondition)) {
    return grantCondition;
  }

  if (objectPolicyCondition === false || grantCondition === true) {
    return objectPolicyCondition;
  }

  return combineSqlConditions([grantCondition, objectPolicyCondition]);
};
