import { z } from 'zod';
import { StepStatus } from '../types/WorkflowRunStateStepInfos';

export const workflowRunStepStatusSchema = z.enum(StepStatus);
