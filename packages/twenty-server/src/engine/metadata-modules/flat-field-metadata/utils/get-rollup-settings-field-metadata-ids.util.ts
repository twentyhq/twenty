import { type FieldMetadataRollupSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRollupSettingsFieldMetadataIds = ({
  relationFieldMetadataId,
  aggregatedFieldMetadataId,
  filters,
}: Pick<
  FieldMetadataRollupSettings,
  'relationFieldMetadataId' | 'aggregatedFieldMetadataId' | 'filters'
>): string[] =>
  [
    relationFieldMetadataId,
    aggregatedFieldMetadataId,
    ...filters.flatMap((filter) => [
      filter.fieldMetadataId,
      filter.relationTargetFieldMetadataId,
    ]),
  ].filter(isDefined);
