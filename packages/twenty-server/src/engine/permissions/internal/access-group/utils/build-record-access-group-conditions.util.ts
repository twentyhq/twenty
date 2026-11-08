/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-condition-metadata-maps.type';
import { buildRecordAccessGroupConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-condition-or-throw.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';

export const buildRecordAccessGroupConditions = ({
  flatObjectMetadata,
  metadataMaps,
  accessGroups,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupConditionMetadataMaps;
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
