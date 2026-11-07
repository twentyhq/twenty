import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { LogicFunctionException } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { logicFunctionGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/logic-function/utils/logic-function-graphql-api-exception-handler.utils';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';

export const messagingProviderGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof MessagingProviderException) {
    switch (error.code) {
      case MessagingProviderExceptionCode.MESSAGING_PROVIDER_NOT_FOUND:
      case MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE:
        throw new NotFoundError(error);
      case MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT:
        throw new UserInputError(error);
      case MessagingProviderExceptionCode.MESSAGING_PROVIDER_NAME_ALREADY_EXISTS:
        throw new ConflictError(error);
      case MessagingProviderExceptionCode.SEND_MESSAGE_FAILED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof LogicFunctionException) {
    return logicFunctionGraphQLApiExceptionHandler(error);
  }

  throw error;
};
