import { type FieldMetadataType } from 'twenty-shared/types';

import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';

export type FlatFieldMetadataTypeValidator = {
  [P in FieldMetadataType]: (
    args: ValidateOneFieldMetadataArgs<P>,
  ) =>
    | FailedFlatFieldMetadataValidationExceptions[]
    | Promise<FailedFlatFieldMetadataValidationExceptions[]>;
};
