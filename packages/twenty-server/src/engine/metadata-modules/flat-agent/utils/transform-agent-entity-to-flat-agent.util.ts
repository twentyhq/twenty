import { isDefined } from 'twenty-shared/utils';

import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';

type TransformAgentEntityToFlatAgentArgs = {
  agentEntity: AgentEntity;
} & EntityManyToOneIdByUniversalIdentifierMaps<'agent'>;

export const transformAgentEntityToFlatAgent = ({
  agentEntity,
  applicationIdToUniversalIdentifierMap,
}: TransformAgentEntityToFlatAgentArgs): FlatAgent => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(agentEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${agentEntity.applicationId} not found for agent ${agentEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    createdAt: agentEntity.createdAt.toISOString(),
    deletedAt: agentEntity.deletedAt?.toISOString() ?? null,
    updatedAt: agentEntity.updatedAt.toISOString(),
    id: agentEntity.id,
    standardId: agentEntity.standardId,
    name: agentEntity.name,
    label: agentEntity.label,
    icon: agentEntity.icon,
    description: agentEntity.description,
    prompt: agentEntity.prompt,
    modelId: agentEntity.modelId,
    responseFormat: agentEntity.responseFormat,
    workspaceId: agentEntity.workspaceId,
    isCustom: agentEntity.isCustom,
    universalIdentifier: agentEntity.universalIdentifier,
    applicationId: agentEntity.applicationId,
    modelConfiguration: agentEntity.modelConfiguration,
    evaluationInputs: agentEntity.evaluationInputs,
    __universal: {
      universalIdentifier: agentEntity.universalIdentifier,
      applicationUniversalIdentifier,
      responseFormat: agentEntity.responseFormat,
      modelConfiguration: agentEntity.modelConfiguration,
    },
  };
};
