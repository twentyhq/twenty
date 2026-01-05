import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatAgent = FlatEntityFrom<AgentEntity>;

export type FlatAgentWithRoleId = FlatAgent & { roleId: string | null };
