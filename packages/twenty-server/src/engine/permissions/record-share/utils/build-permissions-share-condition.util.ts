/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { buildRecordShareCondition } from 'src/engine/permissions/record-share/utils/build-record-share-condition.util';
import { type SqlCondition } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';

export const buildPermissionsShareCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
  isLimitedToPrivateRecords,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  isLimitedToPrivateRecords: boolean;
}): SqlCondition => {
  const recordShareCondition = buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression,
    objectMetadataId,
    principalIds,
    accessLevels,
    isUncorrelated: !isLimitedToPrivateRecords,
  });

  return isLimitedToPrivateRecords
    ? combineSqlConditions([
        buildRecordPrivacyCondition({ tableAlias, isPrivate: true }),
        recordShareCondition,
      ])
    : recordShareCondition;
};
