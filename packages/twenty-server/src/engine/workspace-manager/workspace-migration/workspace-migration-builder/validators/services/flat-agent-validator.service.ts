import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateAgentNameUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-name-uniqueness.util';
import { validateAgentRequiredProperties } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-required-properties.util';
import { validateAgentResponseFormat } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-response-format.util';

@Injectable()
export class FlatAgentValidatorService {
  public validateFlatAgentCreation({
    flatEntityToValidate: flatAgent,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatAgent.universalIdentifier,
        name: flatAgent.name,
      },
      metadataName: 'agent',
      type: 'create',
    });

    const existingAgents = Object.values(
      optimisticFlatAgentMaps.byUniversalIdentifier,
    ).filter(isDefined);

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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'agent',
      type: 'delete',
    });

    const existingAgent = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
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

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp({
        universalIdentifier: existingAgent.universalIdentifier,
        applicationUniversalIdentifier:
          existingAgent.applicationUniversalIdentifier,
      })
    ) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_IS_STANDARD,
        message: t`Cannot delete standard agent`,
        userFriendlyMessage: msg`Cannot delete standard agent`,
      });
    }

    return validationResult;
  }

  public validateFlatAgentUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<'agent', 'update'> {
    const fromFlatAgent = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatAgentMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp({
        universalIdentifier: fromFlatAgent.universalIdentifier,
        applicationUniversalIdentifier:
          fromFlatAgent.applicationUniversalIdentifier,
      })
    ) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_IS_STANDARD,
        message: t`Cannot update standard agent`,
        userFriendlyMessage: msg`Cannot update standard agent`,
      });
    }

    const optimisticFlatAgent: UniversalFlatAgent = {
      ...fromFlatAgent,
      ...flatEntityUpdate,
    };

    const existingAgents = Object.values(
      optimisticFlatAgentMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((agent) => agent.universalIdentifier !== universalIdentifier);

    validationResult.errors.push(
      ...validateAgentRequiredProperties({
        flatAgent: optimisticFlatAgent,
        updatedProperties: flatEntityUpdate,
      }),
    );

    if (isDefined(flatEntityUpdate.name)) {
      validationResult.errors.push(
        ...validateAgentNameUniqueness({
          name: flatEntityUpdate.name,
          existingFlatAgents: existingAgents,
        }),
      );
    }

    if (isDefined(flatEntityUpdate.responseFormat)) {
      validationResult.errors.push(
        ...validateAgentResponseFormat({
          responseFormat: flatEntityUpdate.responseFormat,
        }),
      );
    }

    return validationResult;
  }
}
