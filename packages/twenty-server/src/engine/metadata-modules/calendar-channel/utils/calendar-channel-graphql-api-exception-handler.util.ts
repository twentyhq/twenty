import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CalendarChannelException,
  CalendarChannelExceptionCode,
} from 'src/engine/metadata-modules/calendar-channel/calendar-channel.exception';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';

export const calendarChannelGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof CalendarChannelException) {
    switch (error.code) {
      case CalendarChannelExceptionCode.CALENDAR_CHANNEL_NOT_FOUND:
        throw new NotFoundError(error);
      case CalendarChannelExceptionCode.INVALID_CALENDAR_CHANNEL_INPUT:
        throw new UserInputError(error);
      case CalendarChannelExceptionCode.CALENDAR_CHANNEL_OWNERSHIP_VIOLATION:
        throw new ForbiddenError(error);
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
