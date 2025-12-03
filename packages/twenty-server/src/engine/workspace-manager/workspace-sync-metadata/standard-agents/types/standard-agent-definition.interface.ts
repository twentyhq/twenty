import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type AgentOutputStrategy = 'direct' | 'synthesize';

export type StandardAgentDefinition = Omit<
  FlatAgent,
  | 'id'
  | 'workspaceId'
  | 'universalIdentifier'
  | 'standardId'
  | 'updatedAt'
  | 'deletedAt'
  | 'createdAt'
> & {
  standardId: string;
  standardRoleId?: string;
  outputStrategy?: AgentOutputStrategy;
};
