import { type FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatObjectMetadataIdAndNames } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-id-and-names.type';
import { ObjectMetadataExceptionCode, type ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatObjectMetadataValidationExceptions =
  | FieldMetadataException
  | ObjectMetadataException
  | InvalidMetadataException;

  export type FailedFlatObjectMetadataValidation = {
    error: ObjectMetadataExceptionCode;
    message: string;
    userFriendlyMessage?: string;
    value?: any; // TODO use generic
  } & Partial<FlatObjectMetadataIdAndNames>;
  