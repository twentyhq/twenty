import { v4 } from 'uuid';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
