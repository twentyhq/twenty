import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';

export type FailedFlatFieldMetadataValidation = {
  error: FieldMetadataExceptionCode; // strictly type
  message: string;
  userFriendlyMessage?: string;
  value?: any; // TODO use generic
} & Partial<FlatFieldMetadataIdObjectIdAndName>;
