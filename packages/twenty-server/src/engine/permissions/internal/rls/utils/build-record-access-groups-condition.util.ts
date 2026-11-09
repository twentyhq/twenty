/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/access-group/constants/access-group-column-names.constant';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordAccessGroupsCondition = ({
  tableAlias,
  callerAccessGroupCompactIds,
}: {
  tableAlias: string;
  callerAccessGroupCompactIds: number[];
}): SqlCondition => {
  const parameterName = `callerAccessGroupCompactIds_${randomBytes(5).toString('hex')}`;

  return {
    sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(ACCESS_GROUP_IDS_COLUMN_NAME)} && CAST(:${parameterName} AS integer[])`,
    parameters: { [parameterName]: callerAccessGroupCompactIds },
  };
};
