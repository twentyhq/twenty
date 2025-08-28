import { type AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

export const agentEntityRelationProperties = [
  'workspace',
  'chatThreads',
  'outgoingHandoffs',
  'incomingHandoffs',
] as const;

export type AgentEntityRelationProperties =
  (typeof agentEntityRelationProperties)[number];

export type FlatAgent = Omit<
  AgentEntity,
  AgentEntityRelationProperties | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  uniqueIdentifier: string;
};
