import { type AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { printAgentTriggers } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/print-agent-triggers.util';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const fromFlatAgentWithRoleIdToAgentDto = ({
  flatAgentWithRoleId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatAgentWithRoleId: FlatAgentWithRoleId;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): AgentDTO => {
  const {
    applicationId,
    createdAt,
    description,
    icon,
    avatarColor,
    avatarShape,
    id,
    isActive,
    isPrivate,
    createdByUserWorkspaceId,
    isSystem,
    label,
    modelConfiguration,
    modelId,
    name,
    prompt,
    responseFormat,
    triggers,
    universalIdentifier,
    updatedAt,
    workspaceId,
    roleId,
  } = resolveEffectiveAgent(flatAgentWithRoleId);

  return {
    createdAt: new Date(createdAt),
    description: description ?? undefined,
    id,
    isActive,
    isPrivate,
    createdByUserWorkspaceId,
    isSystem,
    label,
    modelConfiguration: modelConfiguration ?? undefined,
    modelId,
    name,
    prompt,
    responseFormat,
    triggers: printAgentTriggers({
      triggers,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
    universalIdentifier,
    updatedAt: new Date(updatedAt),
    workspaceId,
    applicationId: applicationId ?? undefined,
    icon: icon ?? undefined,
    avatarColor: avatarColor ?? undefined,
    avatarShape: avatarShape ?? undefined,
    roleId: roleId ?? undefined,
  };
};
