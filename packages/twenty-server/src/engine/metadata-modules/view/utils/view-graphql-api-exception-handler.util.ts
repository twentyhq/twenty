import { assertUnreachable } from 'twenty-shared/utils';

import {
    NotFoundError,
    UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
    ViewFieldException,
    ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import {
    ViewFilterGroupException,
    ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import {
    ViewFilterException,
    ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import {
    ViewGroupException,
    ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view-group.exception';
import {
    ViewSortException,
    ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view-sort.exception';
import {
    ViewException,
    ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { workspaceMigrationBuilderExceptionV2Formatter } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-exception-v2-formatter';

export const viewGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
    return workspaceMigrationBuilderExceptionV2Formatter(error);
  }

  if (error instanceof ViewException) {
    switch (error.code) {
      case ViewExceptionCode.VIEW_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewExceptionCode.INVALID_VIEW_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ViewFieldException) {
    switch (error.code) {
      case ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ViewFilterException) {
    switch (error.code) {
      case ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ViewFilterGroupException) {
    switch (error.code) {
      case ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ViewGroupException) {
    switch (error.code) {
      case ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ViewSortException) {
    switch (error.code) {
      case ViewSortExceptionCode.VIEW_SORT_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ViewSortExceptionCode.INVALID_VIEW_SORT_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
