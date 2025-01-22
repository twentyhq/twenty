import { NextFunction, Request } from 'express';

import { EXCLUDED_OPERATIONS } from 'src/engine/middlewares/constants/excluded-operations';
import { isTokenPresent } from 'src/engine/middlewares/utils/is-token-present.utils';

export const skipIfExcludedOperation = (
  request: Request,
  next: NextFunction,
) => {
  const { body } = request;

  if (
    !isTokenPresent(request) &&
    (!body?.operationName || EXCLUDED_OPERATIONS.includes(body.operationName))
  ) {
    return next();
  }
};
