import { isDefined } from 'twenty-shared/utils';

import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RlsRuleUnreadableFields } from 'src/engine/permissions/internal/masking/types/rls-rule-unreadable-fields.type';
import { type RlsRuleFieldMask } from 'src/engine/permissions/internal/masking/types/rls-rule-field-mask.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const buildRlsRuleFieldMasks = ({
  rlsRulesUnreadableFields,
  flatObjectMetadata,
  metadataMaps,
  tableAlias,
}: {
  rlsRulesUnreadableFields: RlsRuleUnreadableFields[];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatFieldMetadataMaps'>;
  tableAlias: string;
}): RlsRuleFieldMask[] => {
  if (rlsRulesUnreadableFields.length === 0) {
    return [];
  }

  const columnEntries = Object.entries(
    getColumnNameToFieldMetadataIdMap(
      flatObjectMetadata,
      metadataMaps.flatFieldMetadataMaps,
    ),
  );

  return rlsRulesUnreadableFields.flatMap(
    ({ recordFilter, unreadableFieldMetadataIds }) => {
      const condition = renderRowLevelPermissionFilterToSql({
        recordFilter,
        tableAlias,
        objectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      });

      if (!isDefined(condition)) {
        return [];
      }

      return [
        {
          condition,
          columnNames: columnEntries
            .filter(([, fieldMetadataId]) =>
              unreadableFieldMetadataIds.includes(fieldMetadataId),
            )
            .map(([columnName]) => columnName),
        },
      ];
    },
  );
};
