import { ENQUEUE_JOB_PRIORITY } from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';

// Conversion jobs share logicFunctionQueue with real executions and bullmq runs
// the lowest priority value first, so stay strictly above every execution
// producer: the queue default and ENQUEUE_JOB_PRIORITY
export const LOGIC_FUNCTION_PREBUILT_CONVERSION_JOB_PRIORITY =
  ENQUEUE_JOB_PRIORITY * 10;
