import { type FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { type ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatFieldMetadataValidationExceptions =
  | FieldMetadataException
  | ObjectMetadataException
  | InvalidMetadataException;

export type FailedFlatFieldMetadataValidation = {
  error: string; // strictly type
  message: string;
  userFriendlyMessage?: string;
  value?: any; // TODO use generic
} & Partial<FlatFieldMetadataIdObjectIdAndName>;
