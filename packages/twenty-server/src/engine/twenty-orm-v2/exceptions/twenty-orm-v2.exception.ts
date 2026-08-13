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
}

export class TwentyOrmV2Exception extends CustomException<TwentyOrmV2ExceptionCode> {
  constructor(message: string, code: TwentyOrmV2ExceptionCode) {
    super(message, code, { userFriendlyMessage: STANDARD_ERROR_MESSAGE });
  }
}
