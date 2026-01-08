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
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-builder-exception-formatter';

export const pageLayoutGraphqlApiExceptionHandler = (
  error: Error,
  i18n: I18n,
) => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return workspaceMigrationBuilderExceptionFormatter(error, i18n);
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
