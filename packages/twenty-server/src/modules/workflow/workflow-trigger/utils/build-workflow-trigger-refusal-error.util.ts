import { assertUnreachable } from 'twenty-shared/utils';

import {
  type JobQueueMemoryLimitReachedDetails,
  type JobTooLargeDetails,
  type MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

const BYTES_PER_MEBIBYTE = 1024 * 1024;

const formatMebibytes = (bytes: number): string =>
  `${Number((bytes / BYTES_PER_MEBIBYTE).toFixed(2))} MiB`;

export const buildWorkflowTriggerRefusalError = (
  exception: MessageQueueException,
): string => {
  switch (exception.code) {
    case MessageQueueExceptionCode.JOB_TOO_LARGE: {
      const { sizeBytes, maxBytes } = exception.details as JobTooLargeDetails;

      return `Workflow could not start: trigger job exceeds the ${formatMebibytes(maxBytes)} queue size limit (job size: ${sizeBytes} bytes, maximum: ${maxBytes} bytes).`;
    }
    case MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED: {
      const { requestedBytes, availableBytes } =
        exception.details as JobQueueMemoryLimitReachedDetails;

      return `Workflow could not start: queue memory limit reached (requested: ${requestedBytes} bytes, available: ${availableBytes} bytes). Try again when queued jobs have finished.`;
    }
    default:
      return assertUnreachable(exception.code);
  }
};
