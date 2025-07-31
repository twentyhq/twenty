import { EnumFieldMetadataType, FieldMetadataType } from 'twenty-shared/types';

import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';

export const isEnumValidateOneFieldMetadata = <T extends FieldMetadataType>(
  args: ValidateOneFieldMetadataArgs<T>,
): args is ValidateOneFieldMetadataArgs<T> &
  ValidateOneFieldMetadataArgs<EnumFieldMetadataType> =>
  isEnumFieldMetadataType(args.flatFieldMetadataToValidate.type);
