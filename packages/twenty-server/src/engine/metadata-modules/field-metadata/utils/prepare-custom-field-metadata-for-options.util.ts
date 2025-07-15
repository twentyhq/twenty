import { v4 } from 'uuid';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'src/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';

export const prepareCustomFieldMetadataOptions = (
  options: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
): undefined | Pick<FieldMetadataEntity, 'options'> => {
  return {
    options: options.map((option) => ({
      id: v4(),
      ...trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(option, [
        'label',
        'value',
        'id',
      ]),
    })),
  };
};
