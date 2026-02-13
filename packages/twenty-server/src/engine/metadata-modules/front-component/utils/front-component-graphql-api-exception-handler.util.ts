import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

export const frontComponentGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof FrontComponentException) {
    switch (error.code) {
      case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND:
        throw new NotFoundError(error);
      case FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT:
        throw new UserInputError(error);
      case FrontComponentExceptionCode.FRONT_COMPONENT_ALREADY_EXISTS:
        throw new ConflictError(error);
      case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY:
        throw new ForbiddenError(error);
      case FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
