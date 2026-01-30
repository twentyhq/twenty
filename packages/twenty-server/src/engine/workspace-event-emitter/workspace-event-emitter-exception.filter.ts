import { Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { assertUnreachable } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  EventStreamException,
  EventStreamExceptionCode,
} from 'src/engine/subscriptions/event-stream.exception';

@Catch(EventStreamException)
export class WorkspaceEventEmitterExceptionFilter
  implements GqlExceptionFilter
{
  catch(exception: EventStreamException) {
    switch (exception.code) {
      case EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS:
      case EventStreamExceptionCode.EVENT_STREAM_DOES_NOT_EXIST:
      case EventStreamExceptionCode.NOT_AUTHORIZED:
        throw new InternalServerError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: exception.userFriendlyMessage,
        });
      default: {
        throw assertUnreachable(exception.code);
      }
    }
  }
}
