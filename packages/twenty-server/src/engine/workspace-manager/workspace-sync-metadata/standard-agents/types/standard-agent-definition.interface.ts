import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type StandardAgentDefinition = Omit<
  FlatAgent,
  'id' | 'workspaceId' | 'universalIdentifier' | 'standardId'
> & {
  standardId: string;
  standardRoleId?: string;
  // If true, creates a handoff from the default agent to this agent
  createHandoffFromDefaultAgent?: boolean;
};
