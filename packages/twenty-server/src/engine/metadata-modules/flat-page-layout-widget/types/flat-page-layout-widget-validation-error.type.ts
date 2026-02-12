import { type MessageDescriptor } from '@lingui/core';

import { type PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export type FlatPageLayoutWidgetValidationError = {
  code: PageLayoutWidgetExceptionCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};
