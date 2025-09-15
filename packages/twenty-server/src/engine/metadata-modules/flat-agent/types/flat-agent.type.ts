import { type AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

export const agentEntityRelationProperties = [
  'workspace',
  'chatThreads',
  'outgoingHandoffs',
  'incomingHandoffs',
  'application',
] as const;

export type AgentEntityRelationProperties =
  (typeof agentEntityRelationProperties)[number];

export type FlatAgent = Omit<
  AgentEntity,
  AgentEntityRelationProperties | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  universalIdentifier: string;
};
