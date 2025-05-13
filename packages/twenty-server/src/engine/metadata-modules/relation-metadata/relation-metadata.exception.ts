import { CustomException } from 'src/utils/custom-exception';

export class RelationMetadataException extends CustomException {
  code: RelationMetadataExceptionCode;
  constructor(message: string, code: RelationMetadataExceptionCode) {
    super(message, code);
  }
}

export enum RelationMetadataExceptionCode {
  RELATION_METADATA_NOT_FOUND = 'RELATION_METADATA_NOT_FOUND',
  INVALID_RELATION_INPUT = 'INVALID_RELATION_INPUT',
  RELATION_ALREADY_EXISTS = 'RELATION_ALREADY_EXISTS',
  FOREIGN_KEY_NOT_FOUND = 'FOREIGN_KEY_NOT_FOUND',
}
