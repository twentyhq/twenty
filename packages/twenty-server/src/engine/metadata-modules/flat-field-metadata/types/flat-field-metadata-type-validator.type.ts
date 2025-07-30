import { ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FieldMetadataType } from 'twenty-shared/types';

export type FlatFieldMetadataTypeValidator = {
  [P in FieldMetadataType]: (
    args: ValidateOneFieldMetadataArgs<P>,
  ) => Promise<FailedFlatFieldMetadataValidationExceptions[]>;
};
