import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type StandardAgentDefinition = Omit<
  FlatAgent,
  'id' | 'workspaceId' | 'universalIdentifier' | 'standardId'
> & {
  standardId: string;
  standardRoleId?: string;
};
