import { type FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatObjectMetadataValidationExceptions =
  | FieldMetadataException
  | ObjectMetadataException
  | InvalidMetadataException;
