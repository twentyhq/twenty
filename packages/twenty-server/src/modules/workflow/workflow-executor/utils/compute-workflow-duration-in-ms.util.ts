import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

const MAX_DURATION_IN_MS = 365 * 24 * 60 * 60 * 1000;

// Variables resolve duration parts to strings, and an empty part means none of that unit
export const computeWorkflowDurationInMs = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days?: number | string;
  hours?: number | string;
  minutes?: number | string;
  seconds?: number | string;
}): number => {
  const parts = [days, hours, minutes, seconds].map((part) =>
    Number(part || 0),
  );

  // a duration that cannot be read must fail the step, not schedule an invalid date
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) {
    throw new WorkflowStepExecutorException(
      'Duration must be made of non-negative numbers',
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  const [dayCount, hourCount, minuteCount, secondCount] = parts;
  const durationInMs =
    (((dayCount * 24 + hourCount) * 60 + minuteCount) * 60 + secondCount) *
    1000;

  if (durationInMs > MAX_DURATION_IN_MS) {
    throw new WorkflowStepExecutorException(
      'Duration cannot exceed one year',
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  return durationInMs;
};
