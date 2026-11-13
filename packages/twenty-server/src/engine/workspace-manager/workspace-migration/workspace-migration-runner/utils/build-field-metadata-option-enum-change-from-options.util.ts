import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataOptionEntityAvailable } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-entity-available.util';
import { type FieldMetadataOptionEnumChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';
import { fromFieldMetadataOptionsToOptionRows } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-field-metadata-options-to-option-rows.util';

// Before the option table exists there are no option rows, so the enum follows the options of the field update.
// TODO: remove once every instance has run the 2.56 option table command, together with the options column drop.
export const buildFieldMetadataOptionEnumChangeFromOptions = ({
  fromOptions,
  toOptions,
}: {
  fromOptions: FlatFieldMetadata['options'];
  toOptions: FlatFieldMetadata['options'] | undefined;
}): FieldMetadataOptionEnumChange | undefined =>
  isDefined(toOptions) && !isFieldMetadataOptionEntityAvailable()
    ? {
        fromOptionRows: fromFieldMetadataOptionsToOptionRows(fromOptions),
        toOptionRows: fromFieldMetadataOptionsToOptionRows(toOptions),
      }
    : undefined;
