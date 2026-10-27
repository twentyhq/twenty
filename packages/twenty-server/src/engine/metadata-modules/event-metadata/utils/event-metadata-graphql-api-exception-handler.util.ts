import { assertUnreachable } from 'twenty-shared/utils';

import {
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';

export const eventMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof EventMetadataException) {
    switch (error.code) {
      case EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND:
        throw new NotFoundError(error);
      case EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT:
      case EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES:
      case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN_INPUT:
      case EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION:
        throw new UserInputError(error);
      case EventMetadataExceptionCode.EVENT_METADATA_NAME_ALREADY_EXISTS:
        throw new ConflictError(error);
      case EventMetadataExceptionCode.EVENT_SUBSCRIPTION_FORBIDDEN:
        throw new ForbiddenError(error);
      case EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN:
        throw new AuthenticationError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
