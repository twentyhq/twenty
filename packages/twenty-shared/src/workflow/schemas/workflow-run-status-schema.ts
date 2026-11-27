import { z } from 'zod';

export const workflowRunStatusSchema = z.enum([
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'ENQUEUED',
  'STOPPING',
  'STOPPED',
]);
