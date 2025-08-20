import { v4 } from 'uuid';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
