import { assertUnreachable } from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';

export const messageChannelGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof MessageChannelException) {
    switch (error.code) {
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND:
        throw new NotFoundError(error);
      case MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT:
        throw new UserInputError(error);
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION:
        throw new ForbiddenError(error);
      case MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof EmailingDomainException) {
    switch (error.code) {
      case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
        throw new ConflictError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ConnectedAccountException) {
    switch (error.code) {
      case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION:
      case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND:
        throw new ForbiddenError(error);
      default:
        break;
    }
  }

  throw error;
};
