import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type UnreadableFieldsWithRlsRuleFilter } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-rls-rule-filter.type';
import { type UnreadableFieldsWithRlsRuleSqlCondition } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-rls-rule-sql-condition.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const buildUnreadableFieldsWithRlsRuleSqlCondition = ({
  unreadableFieldsWithRlsRuleFilter,
  flatObjectMetadata,
  metadataMaps,
  tableAlias,
}: {
  unreadableFieldsWithRlsRuleFilter: UnreadableFieldsWithRlsRuleFilter[];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatFieldMetadataMaps'>;
  tableAlias: string;
}): UnreadableFieldsWithRlsRuleSqlCondition[] =>
  unreadableFieldsWithRlsRuleFilter.flatMap(
    ({ rlsRuleFilter, fieldMetadataIds }) => {
      const rlsRuleSqlCondition = renderRowLevelPermissionFilterToSql({
        recordFilter: rlsRuleFilter,
        tableAlias,
        objectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      });

      return isDefined(rlsRuleSqlCondition)
        ? [{ rlsRuleSqlCondition, fieldMetadataIds }]
        : [];
    },
  );
