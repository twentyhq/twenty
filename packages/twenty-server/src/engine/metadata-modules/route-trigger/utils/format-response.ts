import { HttpException, HttpStatus } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ServerlessExecuteResult } from 'src/engine/core-modules/serverless/drivers/interfaces/serverless-driver.interface';

export const formatResponse = (result?: ServerlessExecuteResult | null) => {
  if (!isDefined(result)) {
    return result;
  }

  if (result.error) {
    throw new HttpException(
      { errorType: result.error.errorType, message: result.error.errorMessage },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return result.data;
};
