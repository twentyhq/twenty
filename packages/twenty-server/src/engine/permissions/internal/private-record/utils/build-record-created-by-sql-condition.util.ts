/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/created-by-workspace-member-id-column-name.constant';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordCreatedBySQLCondition = ({
  tableAlias,
  workspaceMemberId,
}: {
  tableAlias: string;
  workspaceMemberId: string;
}): SQLCondition => {
  const parameterName = `recordCreatedByWorkspaceMemberId_${randomBytes(5).toString('hex')}`;

  return {
    sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)} = :${parameterName}`,
    parameters: { [parameterName]: workspaceMemberId },
  };
};
