import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';

export const fromFlatAgentWithRoleIdToAgentDto = (
  flatAgentWithRoleId: FlatAgentWithRoleId,
): AgentDTO => {
  const {
    applicationId,
    createdAt,
    description,
    icon,
    id,
    isActive,
    isSystem,
    label,
    modelConfiguration,
    modelId,
    name,
    prompt,
    responseFormat,
    triggers,
    updatedAt,
    workspaceId,
    roleId,
  } = resolveEffectiveAgent(flatAgentWithRoleId);

  return {
    createdAt: new Date(createdAt),
    description: description ?? undefined,
    id,
    isActive,
    isSystem,
    label,
    modelConfiguration: modelConfiguration ?? undefined,
    modelId,
    name,
    prompt,
    responseFormat,
    triggers,
    updatedAt: new Date(updatedAt),
    workspaceId,
    applicationId: applicationId ?? undefined,
    icon: icon ?? undefined,
    roleId: roleId ?? undefined,
  };
};
