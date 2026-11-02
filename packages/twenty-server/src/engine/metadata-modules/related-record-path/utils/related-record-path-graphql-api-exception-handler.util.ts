/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RelatedRecordPathException,
  RelatedRecordPathExceptionCode,
} from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';

export const relatedRecordPathGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof RelatedRecordPathException) {
    switch (error.code) {
      case RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND:
        throw new NotFoundError(error);
      case RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT:
        throw new UserInputError(error);
      case RelatedRecordPathExceptionCode.RELATED_RECORD_PATHS_NOT_ENTITLED:
        throw new ForbiddenError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
