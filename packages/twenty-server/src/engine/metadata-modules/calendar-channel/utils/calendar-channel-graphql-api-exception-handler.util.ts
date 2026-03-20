import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CalendarChannelException,
  CalendarChannelExceptionCode,
} from 'src/engine/metadata-modules/calendar-channel/calendar-channel.exception';

export const calendarChannelGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof CalendarChannelException) {
    switch (error.code) {
      case CalendarChannelExceptionCode.CALENDAR_CHANNEL_NOT_FOUND:
        throw new NotFoundError(error);
      case CalendarChannelExceptionCode.INVALID_CALENDAR_CHANNEL_INPUT:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
