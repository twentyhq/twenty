import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EventMetadataExceptionCode {
  EVENT_METADATA_NOT_FOUND = 'EVENT_METADATA_NOT_FOUND',
  INVALID_EVENT_METADATA_INPUT = 'INVALID_EVENT_METADATA_INPUT',
  EVENT_METADATA_NAME_ALREADY_EXISTS = 'EVENT_METADATA_NAME_ALREADY_EXISTS',
  INVALID_EVENT_PROPERTIES = 'INVALID_EVENT_PROPERTIES',
  INVALID_VISITOR_EVENT_TOKEN_INPUT = 'INVALID_VISITOR_EVENT_TOKEN_INPUT',
  INVALID_EVENT_SUBSCRIPTION = 'INVALID_EVENT_SUBSCRIPTION',
  EVENT_SUBSCRIPTION_FORBIDDEN = 'EVENT_SUBSCRIPTION_FORBIDDEN',
  INVALID_VISITOR_EVENT_TOKEN = 'INVALID_VISITOR_EVENT_TOKEN',
  TOO_MANY_VISITOR_EVENT_STREAMS = 'TOO_MANY_VISITOR_EVENT_STREAMS',
}

const getEventMetadataExceptionUserFriendlyMessage = (
  code: EventMetadataExceptionCode,
) => {
  switch (code) {
    case EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND:
      return msg`Event not found.`;
    case EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT:
      return msg`Invalid event definition.`;
    case EventMetadataExceptionCode.EVENT_METADATA_NAME_ALREADY_EXISTS:
      return msg`An event with this name already exists for this application.`;
    case EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES:
      return msg`The event properties do not match its definition.`;
    case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT:
      return msg`Invalid visitor event token request.`;
    case EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION:
      return msg`Invalid event subscription.`;
    case EventMetadataExceptionCode.EVENT_SUBSCRIPTION_FORBIDDEN:
      return msg`You are not allowed to receive these events.`;
    case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN:
      return msg`This event stream link is invalid or has expired.`;
    case EventMetadataExceptionCode.TOO_MANY_VISITOR_EVENT_STREAMS:
      return msg`Too many open event streams for this visitor.`;
    default:
      assertUnreachable(code);
  }
};

export class EventMetadataException extends CustomException<EventMetadataExceptionCode> {
  constructor(
    message: string,
    code: EventMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getEventMetadataExceptionUserFriendlyMessage(code),
    });
  }
}
