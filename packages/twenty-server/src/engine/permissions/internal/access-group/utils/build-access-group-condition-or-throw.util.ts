/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/access-group-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRecordFilterForRole } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

// null when the group reaches every record of the object
export const buildAccessGroupConditionOrThrow = ({
  accessGroup,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  accessGroup: Pick<AccessGroup, 'roleId' | 'memberFieldValues'>;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: AccessGroupConditionMetadataMaps;
}): SqlCondition | null => {
  const recordFilter = buildRecordFilterForRole({
    ...metadataMaps,
    objectMetadata: flatObjectMetadata,
    roleId: accessGroup.roleId,
    memberFieldValues: accessGroup.memberFieldValues ?? undefined,
  });

  if (!isDefined(recordFilter)) {
    return null;
  }

  return renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
  });
};
