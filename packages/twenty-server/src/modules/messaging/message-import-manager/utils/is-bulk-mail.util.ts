import { isNonEmptyString } from '@sniptt/guards';

import { type MessageHeader } from 'src/modules/messaging/message-import-manager/types/message';

const BULK_LIST_HEADER_NAMES = ['list-unsubscribe', 'list-id'];
const BULK_PRECEDENCE_VALUES = ['bulk', 'list', 'junk'];

export const isBulkMail = (headers: MessageHeader[]): boolean =>
  headers.some(({ name, value }) => {
    const headerName = name.toLowerCase();
    const headerValue = value.trim().toLowerCase();

    if (BULK_LIST_HEADER_NAMES.includes(headerName)) {
      return isNonEmptyString(headerValue);
    }

    if (headerName === 'precedence') {
      return BULK_PRECEDENCE_VALUES.includes(headerValue);
    }

    if (headerName === 'auto-submitted') {
      return isNonEmptyString(headerValue) && headerValue !== 'no';
    }

    return false;
  });
