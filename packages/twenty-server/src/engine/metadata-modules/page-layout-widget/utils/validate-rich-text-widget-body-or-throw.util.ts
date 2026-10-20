import { validateRichTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateRichTextWidgetBodyOrThrow = (body: unknown): void => {
  try {
    validateRichTextFieldOrThrow(body, 'body');
  } catch (error) {
    if (!(error instanceof CommonQueryRunnerException)) {
      throw error;
    }

    throw new PageLayoutWidgetException(
      error.message,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      { userFriendlyMessage: error.userFriendlyMessage },
    );
  }
};
