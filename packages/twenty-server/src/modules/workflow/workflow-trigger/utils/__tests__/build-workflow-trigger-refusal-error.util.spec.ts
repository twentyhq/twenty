import { JobSizeLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-size-limiter';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';
import { computeJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-size-bytes.util';
import { buildWorkflowTriggerRefusalError } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-trigger-refusal-error.util';

const MAX_JOB_SIZE_BYTES = 5 * 1024 * 1024;

const buildSizeLimiter = () =>
  new JobSizeLimiter(
    { incrementCounterForEvent: jest.fn() } as never,
    {
      get: (key: string) =>
        ({
          IS_REDIS_MEMORY_FAIRNESS_ENABLED: true,
          JOB_QUEUE_MAX_JOB_SIZE_BYTES: MAX_JOB_SIZE_BYTES,
        })[key],
    } as never,
  );

const catchError = (callback: () => void): unknown => {
  try {
    callback();
  } catch (error) {
    return error;
  }

  return undefined;
};

describe('buildWorkflowTriggerRefusalError', () => {
  it('should report the serialized job size when an update event repeats a large field value', () => {
    const largeJobTitle = 'x'.repeat(MAX_JOB_SIZE_BYTES / 2);
    const jobData = {
      workspaceId: 'workspace-id',
      workflowId: 'workflow-id',
      coreWorkflowVersionId: 'core-workflow-version-id',
      payload: {
        recordId: 'person-id',
        properties: {
          before: { id: 'person-id', jobTitle: 'Engineer' },
          after: { id: 'person-id', jobTitle: largeJobTitle },
          diff: { jobTitle: { before: 'Engineer', after: largeJobTitle } },
          updatedFields: ['jobTitle'],
        },
      },
    };
    const jobOptions = { retryLimit: 3 };
    const sizeBytes = computeJobSizeBytes({
      data: jobData,
      options: jobOptions,
    });

    expect(Buffer.byteLength(largeJobTitle)).toBeLessThan(MAX_JOB_SIZE_BYTES);
    expect(sizeBytes).toBeGreaterThan(MAX_JOB_SIZE_BYTES);

    const error = catchError(() =>
      buildSizeLimiter().checkJobSizesOrThrow({
        queueName: MessageQueue.workflowQueue,
        jobName: 'WorkflowTriggerJob',
        jobs: [{ index: 0, groupKey: 'workspace:workspace-id', sizeBytes }],
      }),
    );

    if (!(error instanceof MessageQueueException)) {
      throw new Error('Expected the size limiter to refuse the job');
    }

    expect(buildWorkflowTriggerRefusalError(error)).toBe(
      `Workflow could not start: trigger job exceeds the 5 MiB queue size limit (job size: ${sizeBytes} bytes, maximum: ${MAX_JOB_SIZE_BYTES} bytes).`,
    );
  });

  it('should report requested and available bytes when the queue memory limit is reached', () => {
    const exception = new MessageQueueException(
      'Job memory limit reached',
      MessageQueueExceptionCode.JOB_QUEUE_MEMORY_LIMIT_REACHED,
      {
        requestedBytes: 2048,
        availableBytes: 512,
        refusedGroupKeys: ['workspace:workspace-id'],
      },
    );

    expect(buildWorkflowTriggerRefusalError(exception)).toBe(
      'Workflow could not start: queue memory limit reached (requested: 2048 bytes, available: 512 bytes). Try again when queued jobs have finished.',
    );
  });
});
