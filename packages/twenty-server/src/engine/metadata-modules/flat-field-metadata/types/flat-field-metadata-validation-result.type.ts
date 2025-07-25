import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatFieldMetadataValidation = {
  status: 'fail';
  error:
    | FieldMetadataException
    | ObjectMetadataException
    | InvalidMetadataException;
};

type SuccessfulFlatFieldMetadataValidation = {
  status: 'success';
};

export type FlatFieldMetadataValidationResult =
  | FailedFlatFieldMetadataValidation
  | SuccessfulFlatFieldMetadataValidation;
