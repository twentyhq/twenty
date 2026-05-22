import type { ActorMetadata } from 'twenty-shared/types';

export type WorkflowRunToolContext = {
  workspaceId: string;
  actorContext?: ActorMetadata;
};
