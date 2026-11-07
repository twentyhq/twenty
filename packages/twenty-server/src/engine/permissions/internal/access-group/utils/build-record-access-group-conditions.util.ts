/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupObject } from 'src/engine/permissions/internal/access-group/types/record-access-group-object.type';
import { buildRecordAccessGroupConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-condition-or-throw.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';

export const buildRecordAccessGroupConditions = ({
  flatObjectMetadata,
  metadataMaps,
  accessGroups,
}: RecordAccessGroupObject & {
  accessGroups: AccessGroup[];
}): RecordAccessGroupCondition[] =>
  accessGroups.map((accessGroup) => ({
    compactId: accessGroup.compactId,
    condition: buildRecordAccessGroupConditionOrThrow({
      accessGroup,
      flatObjectMetadata,
      tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
      metadataMaps,
    }),
  }));
