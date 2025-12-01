import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

export const fromAgentEntityToFlatAgentDto = ({
  agentEntity,
  roleId
}: {
  agentEntity: AgentEntity;
  roleId: string;
}): AgentDTO => {
  const {
    applicationId,
    createdAt,
    description,
    evaluationInputs,
    icon,
    id,
    isCustom,
    label,
    modelConfiguration,
    modelId,
    name,
    prompt,
    responseFormat,
    standardId,
    updatedAt,
    workspaceId,
  } = agentEntity;

  return {
    createdAt,
    description: description ?? undefined,
    evaluationInputs,
    id,
    isCustom,
    label,
    modelConfiguration: modelConfiguration ?? undefined,
    modelId,
    name,
    prompt,
    responseFormat,
    standardId,
    updatedAt,
    workspaceId,
    applicationId: applicationId ?? undefined,
    icon: icon ?? undefined,
    roleId,
  };
};
