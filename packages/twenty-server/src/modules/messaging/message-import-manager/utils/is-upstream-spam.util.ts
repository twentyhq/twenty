import { isDefined } from 'twenty-shared/utils';

import { UPSTREAM_SPAM_VERDICT_HEADERS } from 'src/modules/messaging/message-import-manager/constants/upstream-spam-verdict-headers.constant';
import { type MessageHeader } from 'src/modules/messaging/message-import-manager/types/message.type';

export const isUpstreamSpam = (headers: MessageHeader[]): boolean =>
  Object.entries(UPSTREAM_SPAM_VERDICT_HEADERS).some(
    ([headerName, spamVerdicts]) => {
      const topmostHeader = headers.find(
        ({ name }) => name.toLowerCase() === headerName,
      );

      if (!isDefined(topmostHeader)) {
        return false;
      }

      return topmostHeader.value
        .split(';')
        .some((token) => spamVerdicts.includes(token.trim().toLowerCase()));
    },
  );
