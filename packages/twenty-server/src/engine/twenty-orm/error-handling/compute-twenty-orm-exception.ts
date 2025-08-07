import { t } from '@lingui/core/macro';
import { QueryFailedError } from 'typeorm';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const computeTwentyORMException = (error: Error) => {
  if (error instanceof QueryFailedError) {
    if (error.message.includes('Query read timeout')) {
      return new TwentyORMException(
        'Query read timeout',
        TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
        {
          userFriendlyMessage: t`We are experiencing a temporary issue with our database. Please try again later.`,
        },
      );
    }
  }

  return error;
};
