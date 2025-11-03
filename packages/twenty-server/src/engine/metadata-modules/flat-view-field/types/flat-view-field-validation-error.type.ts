import { type MessageDescriptor } from '@lingui/core';

import { type ViewFieldExceptionCode } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';

// Centralize
export type FlatViewFieldValidationError = {
  code: ViewFieldExceptionCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};
