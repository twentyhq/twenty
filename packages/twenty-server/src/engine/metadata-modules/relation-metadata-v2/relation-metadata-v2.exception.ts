import { CustomException } from 'src/utils/custom-exception';

export class RelationMetadataV2Exception extends CustomException {
  code: RelationMetadataV2ExceptionCode;
  constructor(message: string, code: RelationMetadataV2ExceptionCode) {
    super(message, code);
  }
}

export enum RelationMetadataV2ExceptionCode {
  RELATION_METADATA_NOT_FOUND = 'RELATION_METADATA_NOT_FOUND',
  INVALID_RELATION_INPUT = 'INVALID_RELATION_INPUT',
  RELATION_ALREADY_EXISTS = 'RELATION_ALREADY_EXISTS',
  FOREIGN_KEY_NOT_FOUND = 'FOREIGN_KEY_NOT_FOUND',
}
