import { ObjectMetadataExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ObjectMetadataException extends CustomException {
  constructor(message: string, code: ObjectMetadataExceptionCode) {
    super(message, code);
  }
}
