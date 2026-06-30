import { z } from 'zod';

export const workflowRunStatusSchema = z.enum([
  'NOT_STARTED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'ENQUEUED',
  'STOPPING',
  'STOPPED',
]);
