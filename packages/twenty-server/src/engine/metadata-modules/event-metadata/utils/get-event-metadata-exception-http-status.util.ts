import { HttpStatus } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { EventMetadataExceptionCode } from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';

export const getEventMetadataExceptionHttpStatus = (
  code: EventMetadataExceptionCode,
): HttpStatus => {
  switch (code) {
    case EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT:
    case EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES:
    case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT:
    case EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION:
      return HttpStatus.BAD_REQUEST;
    case EventMetadataExceptionCode.EVENT_METADATA_NAME_ALREADY_EXISTS:
      return HttpStatus.CONFLICT;
    case EventMetadataExceptionCode.EVENT_SUBSCRIPTION_FORBIDDEN:
      return HttpStatus.FORBIDDEN;
    case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN:
      return HttpStatus.UNAUTHORIZED;
    default:
      return assertUnreachable(code);
  }
};
