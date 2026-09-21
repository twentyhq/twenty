import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { Inject } from '@nestjs/common';

export const getAgentHistoryRepositoryToken = (
  name: AgentHistoryObjectName,
): string => `AgentHistoryRepository:${name}`;

export const InjectAgentHistoryRepository = (
  name: AgentHistoryObjectName,
): ParameterDecorator => Inject(getAgentHistoryRepositoryToken(name));
