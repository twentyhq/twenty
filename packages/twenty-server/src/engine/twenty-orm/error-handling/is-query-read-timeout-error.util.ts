import { QueryFailedError } from 'typeorm';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

// node-postgres aborts queries that exceed its `query_timeout` with this exact message.
// It reflects transient database/worker load rather than a code defect, so it is retried
// (BullMQ failure metric + sync recovery crons) instead of being surfaced as a bug.
export const QUERY_READ_TIMEOUT_ERROR_MESSAGE = 'Query read timeout';

export const isQueryReadTimeoutError = (error: Error): boolean => {
  if (
    error instanceof TwentyORMException &&
    error.code === TwentyORMExceptionCode.QUERY_READ_TIMEOUT
  ) {
    return true;
  }

  return (
    error instanceof QueryFailedError &&
    error.message.includes(QUERY_READ_TIMEOUT_ERROR_MESSAGE)
  );
};
