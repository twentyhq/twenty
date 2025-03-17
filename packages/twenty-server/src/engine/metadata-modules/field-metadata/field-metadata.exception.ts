import { FieldMetadataExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class FieldMetadataException extends CustomException {
  constructor(message: string, code: FieldMetadataExceptionCode) {
    super(message, code);
  }
}
