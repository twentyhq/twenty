import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const isDuplicateEntryError = (
  error: unknown,
): error is TwentyOrmException =>
  error instanceof TwentyOrmException &&
  error.code === TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED;
