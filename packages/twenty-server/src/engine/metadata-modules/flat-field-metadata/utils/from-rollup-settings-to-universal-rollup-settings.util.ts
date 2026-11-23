import { type FieldMetadataRollupSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-rollup-settings.type';
import { fromViewFieldRelationScopeToUniversalRelationScope } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-relation-scope-to-universal-relation-scope.util';

export const fromRollupSettingsToUniversalRollupSettings = ({
  settings: {
    relationFieldMetadataId,
    aggregatedFieldMetadataId,
    filters,
    filterGroups,
    ...settings
  },
  fieldMetadataUniversalIdentifierById,
}: {
  settings: FieldMetadataRollupSettings;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalRollupSettings => ({
  ...settings,
  relationFieldMetadataUniversalIdentifier:
    fieldMetadataUniversalIdentifierById[relationFieldMetadataId] ?? null,
  aggregatedFieldMetadataUniversalIdentifier: isDefined(
    aggregatedFieldMetadataId,
  )
    ? (fieldMetadataUniversalIdentifierById[aggregatedFieldMetadataId] ?? null)
    : null,
  filters: fromViewFieldRelationScopeToUniversalRelationScope({
    relationScope: { filters, filterGroups, sorts: [] },
    fieldMetadataUniversalIdentifierById,
  }).filters,
  filterGroups,
});
