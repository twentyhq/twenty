import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RlsRuleUnreadableFields } from 'src/engine/permissions/internal/masking/types/rls-rule-unreadable-fields.type';
import { type UnreadableFieldsWithCondition } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-condition.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const buildUnreadableFieldsWithCondition = ({
  rlsRulesUnreadableFields,
  flatObjectMetadata,
  metadataMaps,
  tableAlias,
}: {
  rlsRulesUnreadableFields: RlsRuleUnreadableFields[];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatFieldMetadataMaps'>;
  tableAlias: string;
}): UnreadableFieldsWithCondition[] =>
  rlsRulesUnreadableFields.flatMap(
    ({ recordFilter, unreadableFieldMetadataIds }) => {
      const condition = renderRowLevelPermissionFilterToSql({
        recordFilter,
        tableAlias,
        objectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      });

      return isDefined(condition)
        ? [{ condition, fieldMetadataIds: unreadableFieldMetadataIds }]
        : [];
    },
  );
