import {
  type TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

// Codes that describe a problem with the caller's input rather than a server
// fault; the API layers surface them as user input errors (400) instead of 500
export const isTwentyOrmUserInputError = (
  error: TwentyOrmException,
): boolean => {
  switch (error.code) {
    case TwentyOrmExceptionCode.INVALID_INPUT:
    case TwentyOrmExceptionCode.INVALID_PARAMETER:
    case TwentyOrmExceptionCode.UNKNOWN_OBJECT:
    case TwentyOrmExceptionCode.UNKNOWN_COLUMN:
    case TwentyOrmExceptionCode.UNKNOWN_RELATION:
    case TwentyOrmExceptionCode.UNSUPPORTED_OPERATION:
    case TwentyOrmExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
    case TwentyOrmExceptionCode.ENTITY_NOT_FOUND:
    case TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED:
    case TwentyOrmExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case TwentyOrmExceptionCode.CONNECT_NOT_ALLOWED:
    case TwentyOrmExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
    case TwentyOrmExceptionCode.RLS_VALIDATION_FAILED:
      return true;
    default:
      return false;
  }
};
