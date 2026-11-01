/* @license Enterprise */

import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';

export const buildPermissionsObjectCondition = ({
  tableAlias,
  isLimitedToPublicRecords,
}: {
  tableAlias: string;
  isLimitedToPublicRecords: boolean;
}): SqlCondition =>
  isLimitedToPublicRecords
    ? buildRecordPrivacyCondition({ tableAlias, isPrivate: false })
    : { sql: 'TRUE', parameters: {} };
