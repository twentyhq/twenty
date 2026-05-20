import { z } from 'zod';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const workflowRunStatusSchema = z.enum(
  Object.values(WorkflowRunStatus) as [string, ...string[]],
);
