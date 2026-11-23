import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

export const fromFieldMetadataOptionsToOptionRows = (
  options: FlatFieldMetadata['options'],
): FieldMetadataOptionRowForOptions[] =>
  (options ?? []).flatMap((option) =>
    isDefined(option.id)
      ? [
          {
            universalIdentifier: option.id,
            value: option.value,
            label: option.label,
            color:
              'color' in option && isString(option.color) ? option.color : null,
            position: option.position,
          },
        ]
      : [],
  );
