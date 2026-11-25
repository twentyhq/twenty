import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
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
        throw new UserInputError(error);
      case EventMetadataExceptionCode.EVENT_METADATA_NAME_ALREADY_EXISTS:
        throw new ConflictError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
