import { type AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const agentEntityRelationProperties = [
  'workspace',
  'application',
] as const;

export type AgentEntityRelationProperties =
  (typeof agentEntityRelationProperties)[number];

export type FlatAgent = FlatEntityFrom<
  AgentEntity,
  AgentEntityRelationProperties | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
