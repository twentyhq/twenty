import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

export const DEFAULT_AGENT_WORKFLOW_ACTOR: ActorMetadata = {
  source: FieldActorSource.AGENT,
  workspaceMemberId: null,
  name: 'Agent',
  context: {},
};
