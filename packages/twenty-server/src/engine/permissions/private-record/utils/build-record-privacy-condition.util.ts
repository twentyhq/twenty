/* @license Enterprise */

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordPrivacyCondition = ({
  tableAlias,
  isPrivate,
}: {
  tableAlias: string;
  isPrivate: boolean;
}): SqlCondition => ({
  sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = ${isPrivate ? 'TRUE' : 'FALSE'}`,
  parameters: {},
});
