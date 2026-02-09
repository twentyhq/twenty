import { isDefined } from 'twenty-shared/utils';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const transformAgentEntityToFlatAgent = ({
  entity: agentEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'agent'>): FlatAgent => {
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
    applicationUniversalIdentifier,
  };
};
