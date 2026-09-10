import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';

export type CachedCronTrigger = {
  workspaceId: string;
  workflowId: string;
  pattern: string;
} & CoreDispatchIds;
