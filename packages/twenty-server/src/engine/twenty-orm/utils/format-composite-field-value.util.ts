import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const formatCompositeFieldValue = (
  value: unknown,
  compositePropertyName: string,
  fieldMetadata: FlatFieldMetadata,
) => {
  switch (fieldMetadata.type) {
    case FieldMetadataType.CURRENCY: {
      if (compositePropertyName === 'amountMicros') {
        if (isNonEmptyString(value)) {
          return parseInt(value);
        }

        return value;
      }
      break;
    }
    case FieldMetadataType.ADDRESS: {
      if (
        compositePropertyName === 'addressLat' ||
        compositePropertyName === 'addressLng'
      ) {
        if (isNonEmptyString(value)) {
          return parseFloat(value);
        }

        return value;
      }
      break;
    }
  }

  return value;
};
