import { isDefined } from 'twenty-shared/utils';

import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RuleFieldDenial } from 'src/engine/permissions/internal/masking/types/rule-field-denial.type';
import { type RuleFieldMask } from 'src/engine/permissions/internal/masking/types/rule-field-mask.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const buildRuleFieldMasks = ({
  ruleFieldDenials,
  flatObjectMetadata,
  metadataMaps,
  tableAlias,
}: {
  ruleFieldDenials: RuleFieldDenial[];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatFieldMetadataMaps'>;
  tableAlias: string;
}): RuleFieldMask[] => {
  if (ruleFieldDenials.length === 0) {
    return [];
  }

  const columnEntries = Object.entries(
    getColumnNameToFieldMetadataIdMap(
      flatObjectMetadata,
      metadataMaps.flatFieldMetadataMaps,
    ),
  );

  return ruleFieldDenials.flatMap(
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
