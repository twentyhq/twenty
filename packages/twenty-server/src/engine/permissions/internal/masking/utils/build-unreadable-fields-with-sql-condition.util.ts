import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type UnreadableFieldsWithRecordFilter } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-record-filter.type';
import { type UnreadableFieldsWithSqlCondition } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-sql-condition.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const buildUnreadableFieldsWithSqlCondition = ({
  unreadableFieldsWithRecordFilter,
  flatObjectMetadata,
  metadataMaps,
  tableAlias,
}: {
  unreadableFieldsWithRecordFilter: UnreadableFieldsWithRecordFilter[];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatFieldMetadataMaps'>;
  tableAlias: string;
}): UnreadableFieldsWithSqlCondition[] =>
  unreadableFieldsWithRecordFilter.flatMap(
    ({ recordFilter, unreadableFieldMetadataIds }) => {
      const sqlCondition = renderRowLevelPermissionFilterToSql({
        recordFilter,
        tableAlias,
        objectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      });

      return isDefined(sqlCondition)
        ? [{ sqlCondition, fieldMetadataIds: unreadableFieldMetadataIds }]
        : [];
    },
  );
