import {
  type TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';

export const isTwentyOrmV2UserInputError = (
  error: TwentyOrmV2Exception,
): boolean => {
  switch (error.code) {
    case TwentyOrmV2ExceptionCode.INVALID_PARAMETER:
    case TwentyOrmV2ExceptionCode.UNKNOWN_OBJECT:
    case TwentyOrmV2ExceptionCode.UNKNOWN_COLUMN:
    case TwentyOrmV2ExceptionCode.UNKNOWN_RELATION:
    case TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION:
    case TwentyOrmV2ExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
    case TwentyOrmV2ExceptionCode.ENTITY_NOT_FOUND:
      return true;
    default:
      return false;
  }
};
