import { CustomException } from 'src/utils/custom-exception';

export class FieldMetadataException extends CustomException {
  code: FieldMetadataExceptionCode;
  constructor(message: string, code: FieldMetadataExceptionCode) {
    super(message, code);
  }
}

export enum FieldMetadataExceptionCode {
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  INVALID_FIELD_INPUT = 'INVALID_FIELD_INPUT',
  FIELD_MUTATION_NOT_ALLOWED = 'FIELD_MUTATION_NOT_ALLOWED',
  FIELD_ALREADY_EXISTS = 'FIELD_ALREADY_EXISTS',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
