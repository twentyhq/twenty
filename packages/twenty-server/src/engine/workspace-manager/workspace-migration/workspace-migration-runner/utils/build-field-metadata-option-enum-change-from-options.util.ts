import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataOptionEntityAvailable } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-entity-available.util';
import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FieldMetadataOptionEnumChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';

const toOptionRows = (
  options: FlatFieldMetadata['options'],
): FieldMetadataOptionRowForOptions[] =>
  (options ?? [])
    .filter((option) => isDefined(option.id))
    .map((option) => ({
      universalIdentifier: option.id as string,
      value: option.value,
      label: option.label,
      color: 'color' in option && isString(option.color) ? option.color : null,
      position: option.position,
    }));

// An upgrade step that runs before the option table exists has no option rows to follow, so the enum
// follows the options carried by the field update.
export const buildFieldMetadataOptionEnumChangeFromOptions = ({
  fromOptions,
  toOptions,
}: {
  fromOptions: FlatFieldMetadata['options'];
  toOptions: FlatFieldMetadata['options'] | undefined;
}): FieldMetadataOptionEnumChange | undefined =>
  isDefined(toOptions) && !isFieldMetadataOptionEntityAvailable()
    ? {
        fromOptionRows: toOptionRows(fromOptions),
        toOptionRows: toOptionRows(toOptions),
      }
    : undefined;
