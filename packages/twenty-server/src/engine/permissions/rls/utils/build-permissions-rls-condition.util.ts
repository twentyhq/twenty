/* @license Enterprise */

import { buildPermissionsObjectCondition } from 'src/engine/permissions/role/utils/build-permissions-object-condition.util';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';

export const buildPermissionsRlsCondition = ({
  tableAlias,
  rlsCondition,
  isLimitedToPublicRecords,
}: {
  tableAlias: string;
  rlsCondition: SqlCondition;
  isLimitedToPublicRecords: boolean;
}): SqlCondition =>
  isLimitedToPublicRecords
    ? combineSqlConditions([
        rlsCondition,
        buildPermissionsObjectCondition({
          tableAlias,
          isLimitedToPublicRecords,
        }),
      ])
    : rlsCondition;
