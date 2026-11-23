import { isDefined } from 'twenty-shared/utils';

import { type UniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-rollup-settings.type';

export const getUniversalRollupSettingsFieldMetadataUniversalIdentifiers = ({
  relationFieldMetadataUniversalIdentifier,
  aggregatedFieldMetadataUniversalIdentifier,
  filters,
}: Pick<
  UniversalRollupSettings,
  | 'relationFieldMetadataUniversalIdentifier'
  | 'aggregatedFieldMetadataUniversalIdentifier'
  | 'filters'
>): string[] =>
  [
    relationFieldMetadataUniversalIdentifier,
    aggregatedFieldMetadataUniversalIdentifier,
    ...filters.map((filter) => filter.fieldMetadataUniversalIdentifier),
  ].filter(isDefined);
