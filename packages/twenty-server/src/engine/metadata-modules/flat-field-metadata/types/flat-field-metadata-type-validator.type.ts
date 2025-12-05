import { type FieldMetadataType } from 'twenty-shared/types';

import { type GenericValidateFlatFieldMetadataTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FlatFieldMetadataTypeValidationArgs<T extends FieldMetadataType> =
  Omit<
    GenericValidateFlatFieldMetadataTypeSpecificitiesArgs,
    'flatEntityToValidate'
  > & {
    flatEntityToValidate: FlatFieldMetadata<T>;
  };

export type FlatFieldMetadataTypeValidator = {
  [T in FieldMetadataType]: (
    args: FlatFieldMetadataTypeValidationArgs<T>,
  ) => FlatFieldMetadataValidationError[];
};
