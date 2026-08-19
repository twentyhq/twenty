import { type MessageDescriptor } from '@lingui/core';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum TwentyOrmV2ExceptionCode {
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MALFORMED_SQL = 'MALFORMED_SQL',
  UNKNOWN_OBJECT = 'UNKNOWN_OBJECT',
  UNKNOWN_COLUMN = 'UNKNOWN_COLUMN',
  UNKNOWN_RELATION = 'UNKNOWN_RELATION',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  MISSING_ALIAS = 'MISSING_ALIAS',
  INVALID_QUERY = 'INVALID_QUERY',
  TOO_MANY_RECORDS_TO_UPDATE = 'TOO_MANY_RECORDS_TO_UPDATE',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  QUERY_READ_TIMEOUT = 'QUERY_READ_TIMEOUT',
  DUPLICATE_ENTRY_DETECTED = 'DUPLICATE_ENTRY_DETECTED',
  INVALID_INPUT = 'INVALID_INPUT',
}

export class TwentyOrmV2Exception extends CustomException<TwentyOrmV2ExceptionCode> {
  constructor(
    message: string,
    code: TwentyOrmV2ExceptionCode,
    userFriendlyMessage: MessageDescriptor = STANDARD_ERROR_MESSAGE,
  ) {
    super(message, code, { userFriendlyMessage });
  }
}
