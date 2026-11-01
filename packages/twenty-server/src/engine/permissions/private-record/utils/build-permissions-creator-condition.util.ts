/* @license Enterprise */

import { buildRecordCreatedByCondition } from 'src/engine/permissions/private-record/utils/build-record-created-by-condition.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';

export const buildPermissionsCreatorCondition = ({
  tableAlias,
  workspaceMemberId,
}: {
  tableAlias: string;
  workspaceMemberId: string;
}): SqlCondition =>
  combineSqlConditions([
    buildRecordPrivacyCondition({ tableAlias, isPrivate: true }),
    buildRecordCreatedByCondition({ tableAlias, workspaceMemberId }),
  ]);
