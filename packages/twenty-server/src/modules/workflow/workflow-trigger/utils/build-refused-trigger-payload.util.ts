import { createHash } from 'crypto';

import {
  type MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

export const buildRefusedTriggerPayload = ({
  exception,
  payload,
}: {
  exception: MessageQueueException;
  payload: object;
}): object => {
  if (exception.code !== MessageQueueExceptionCode.JOB_TOO_LARGE) {
    return payload;
  }

  const serializedPayload = JSON.stringify(payload);

  return {
    payloadSizeBytes: Buffer.byteLength(serializedPayload),
    payloadHash: createHash('sha256').update(serializedPayload).digest('hex'),
  };
};
