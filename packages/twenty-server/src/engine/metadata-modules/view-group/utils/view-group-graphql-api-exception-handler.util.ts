import { type I18n } from '@lingui/core';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { viewGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception-handler.util';

export const viewGroupGraphqlApiExceptionHandler = (
  error: Error,
  i18n: I18n,
) => {
  if (error instanceof ViewGroupException) {
    if (
      error.code ===
      ViewGroupExceptionCode.MISSING_MAIN_GROUP_BY_FIELD_METADATA_ID
    ) {
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    }
  }

  return viewGraphqlApiExceptionHandler(error, i18n);
};
