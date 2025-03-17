import { RelationMetadataExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class RelationMetadataException extends CustomException {
  constructor(message: string, code: RelationMetadataExceptionCode) {
    super(message, code);
  }
}
