import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

// Tool callers always carry an actor; this only covers dispatchers that have
// not resolved one, and never stands in for a human workspace member.
export const DEFAULT_AGENT_WORKFLOW_ACTOR: ActorMetadata = {
  source: FieldActorSource.AGENT,
  workspaceMemberId: null,
  name: 'Agent',
  context: {},
};
