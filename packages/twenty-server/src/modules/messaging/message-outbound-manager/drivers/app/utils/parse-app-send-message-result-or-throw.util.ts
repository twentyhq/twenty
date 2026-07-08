import { z } from 'zod';

import {
  MessageOutboundDriverException,
  MessageOutboundDriverExceptionCode,
} from 'src/modules/messaging/message-outbound-manager/drivers/exceptions/message-outbound-driver.exception';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

const appSendMessageResultSchema = z.object({
  messageExternalId: z.string().min(1),
  threadExternalId: z.string().min(1).optional(),
  headerMessageId: z.string().min(1).optional(),
});

export const parseAppSendMessageResultOrThrow = (
  data: object | null,
): SendMessageResult => {
  const parsedResult = appSendMessageResultSchema.safeParse(data);

  if (!parsedResult.success) {
    throw new MessageOutboundDriverException(
      'Send message function did not return a valid result with a messageExternalId',
      MessageOutboundDriverExceptionCode.INVALID_SEND_MESSAGE_FUNCTION_RESULT,
    );
  }

  const { messageExternalId, threadExternalId, headerMessageId } =
    parsedResult.data;

  return {
    headerMessageId: headerMessageId ?? messageExternalId,
    messageExternalId,
    threadExternalId,
  };
};
