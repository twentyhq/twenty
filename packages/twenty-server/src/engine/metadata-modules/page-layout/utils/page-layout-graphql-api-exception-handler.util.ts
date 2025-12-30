import { type I18n } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { workspaceMigrationBuilderExceptionV2Formatter } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-exception-v2-formatter';

export const pageLayoutGraphqlApiExceptionHandler = (
  error: Error,
  i18n: I18n,
) => {
  if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
    return workspaceMigrationBuilderExceptionV2Formatter(error, i18n);
  }

  if (error instanceof PageLayoutException) {
    switch (error.code) {
      case PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA:
      case PageLayoutExceptionCode.TAB_NOT_FOUND_FOR_WIDGET_DUPLICATION:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof PageLayoutTabException) {
    switch (error.code) {
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof PageLayoutWidgetException) {
    switch (error.code) {
      case PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA:
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
