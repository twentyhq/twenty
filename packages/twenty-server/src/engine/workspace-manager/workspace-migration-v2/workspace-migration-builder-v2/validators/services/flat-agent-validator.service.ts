import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateAgentNameUniqueness } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-agent-name-uniqueness.util';
import { validateAgentRequiredProperties } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-agent-required-properties.util';
import { validateAgentResponseFormat } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-agent-response-format.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatAgentValidatorService {
  public validateFlatAgentCreation({
    flatEntityToValidate: flatAgent,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatAgent.id,
        universalIdentifier: flatAgent.universalIdentifier,
        name: flatAgent.name,
      },
      metadataName: 'agent',
      type: 'create',
    });

    const existingAgents = Object.values(optimisticFlatAgentMaps.byId).filter(
      isDefined,
    );

    validationResult.errors.push(
      ...validateAgentRequiredProperties({
        flatAgent,
      }),
    );

    validationResult.errors.push(
      ...validateAgentNameUniqueness({
        name: flatAgent.name,
        existingFlatAgents: existingAgents,
      }),
    );

    if (isDefined(flatAgent.responseFormat)) {
      validationResult.errors.push(
        ...validateAgentResponseFormat({
          responseFormat: flatAgent.responseFormat,
        }),
      );
    }

    return validationResult;
  }

  public validateFlatAgentDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
    buildOptions,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'agent',
      type: 'delete',
    });

    const existingAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatAgentMaps,
    });

    if (!isDefined(existingAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent not found`,
        userFriendlyMessage: msg`Agent not found`,
      });

      return validationResult;
    }

    if (!buildOptions.isSystemBuild && isStandardMetadata(existingAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_IS_STANDARD,
        message: t`Cannot delete standard agent`,
        userFriendlyMessage: msg`Cannot delete standard agent`,
      });
    }

    return validationResult;
  }

  public validateFlatAgentUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'update'> {
    const fromFlatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatAgentMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatAgent?.universalIdentifier,
      },
      metadataName: 'agent',
      type: 'update',
    });

    if (!isDefined(fromFlatAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent not found`,
        userFriendlyMessage: msg`Agent not found`,
      });

      return validationResult;
    }

    if (!buildOptions.isSystemBuild && isStandardMetadata(fromFlatAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_IS_STANDARD,
        message: t`Cannot update standard agent`,
        userFriendlyMessage: msg`Cannot update standard agent`,
      });
    }

    const partialFlatAgent: Partial<FlatAgent> =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      });

    const optimisticFlatAgent: FlatAgent = {
      ...fromFlatAgent,
      ...partialFlatAgent,
    };

    const existingAgents = Object.values(optimisticFlatAgentMaps.byId)
      .filter(isDefined)
      .filter((agent) => agent.id !== flatEntityId);

    validationResult.errors.push(
      ...validateAgentRequiredProperties({
        flatAgent: optimisticFlatAgent,
        updatedProperties: partialFlatAgent,
      }),
    );

    if (isDefined(partialFlatAgent.name)) {
      validationResult.errors.push(
        ...validateAgentNameUniqueness({
          name: partialFlatAgent.name,
          existingFlatAgents: existingAgents,
        }),
      );
    }

    if (isDefined(partialFlatAgent.responseFormat)) {
      validationResult.errors.push(
        ...validateAgentResponseFormat({
          responseFormat: partialFlatAgent.responseFormat,
        }),
      );
    }

    return validationResult;
  }
}
