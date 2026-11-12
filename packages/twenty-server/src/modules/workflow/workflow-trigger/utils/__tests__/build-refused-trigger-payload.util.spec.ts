import { createHash } from 'crypto';

import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { buildRefusedTriggerPayload } from 'src/modules/workflow/workflow-trigger/utils/build-refused-trigger-payload.util';

const PAYLOAD = {
  recordId: 'person-id',
  properties: { after: { id: 'person-id', jobTitle: 'é'.repeat(10) } },
};

describe('buildRefusedTriggerPayload', () => {
  it('should replace an oversized payload with its size and hash', () => {
    const serializedPayload = JSON.stringify(PAYLOAD);

    expect(
      buildRefusedTriggerPayload({
        exception: new MessageQueueException(
          'Job too large',
          MessageQueueExceptionCode.JOB_TOO_LARGE,
          { index: 0, sizeBytes: 6_000_000, maxBytes: 5_242_880 },
        ),
        payload: PAYLOAD,
      }),
    ).toEqual({
      payloadSizeBytes: Buffer.byteLength(serializedPayload),
      payloadHash: createHash('sha256').update(serializedPayload).digest('hex'),
    });
  });

  it('should keep the payload when the queue memory limit is reached', () => {
    expect(
      buildRefusedTriggerPayload({
        exception: new MessageQueueException(
          'Job memory limit reached',
          MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
          {
            requestedBytes: 2048,
            availableBytes: 512,
            refusedGroupKeys: ['workspace:workspace-id'],
          },
        ),
        payload: PAYLOAD,
      }),
    ).toBe(PAYLOAD);
  });
});
