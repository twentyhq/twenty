import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/twenty-orm.exception';

export const isDuplicateEntryError = (error: unknown): boolean =>
  error instanceof TwentyOrmException &&
  error.code === TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED;
