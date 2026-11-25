import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EventMetadataExceptionCode {
  EVENT_METADATA_NOT_FOUND = 'EVENT_METADATA_NOT_FOUND',
  INVALID_EVENT_METADATA_INPUT = 'INVALID_EVENT_METADATA_INPUT',
  EVENT_METADATA_NAME_ALREADY_EXISTS = 'EVENT_METADATA_NAME_ALREADY_EXISTS',
  INVALID_EVENT_PROPERTIES = 'INVALID_EVENT_PROPERTIES',
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
