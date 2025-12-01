import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentJsonResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

@Injectable()
export class FlatAgentValidatorService {
  public validateFlatAgentCreation({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatAgentMaps },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<FlatAgent> {
    const validationResult: FailedFlatEntityValidation<FlatAgent> = {
      type: 'create_agent',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        name: flatEntityToValidate.name,
      },
    };

    if (flatEntityToValidate.label === '') {
      validationResult.errors.push({
        code: AgentExceptionCode.INVALID_AGENT_INPUT,
        message: t`Label cannot be empty`,
        userFriendlyMessage: msg`Label cannot be empty`,
      });
    }

    if (flatEntityToValidate.prompt === '') {
      validationResult.errors.push({
        code: AgentExceptionCode.INVALID_AGENT_INPUT,
        message: t`Prompt cannot be empty`,
        userFriendlyMessage: msg`Prompt cannot be empty`,
      });
    }

    if (flatEntityToValidate.modelId === '') {
      validationResult.errors.push({
        code: AgentExceptionCode.INVALID_AGENT_INPUT,
        message: t`Model ID cannot be empty`,
        userFriendlyMessage: msg`Model ID cannot be empty`,
      });
    }

    const allExistingFlatAgents = Object.values(flatAgentMaps.byId).filter(
      isDefined,
    );

    const existingAgentWithSameName = allExistingFlatAgents.find(
      (agent) =>
        agent.name === flatEntityToValidate.name &&
        agent.id !== flatEntityToValidate.id,
    );

    if (isDefined(existingAgentWithSameName)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_ALREADY_EXISTS,
        message: t`Agent with name "${flatEntityToValidate.name}" already exists`,
        userFriendlyMessage: msg`An agent with this name already exists`,
      });
    }

    if (isDefined(flatEntityToValidate.responseFormat)) {
      const responseFormat = flatEntityToValidate.responseFormat;
      const type = responseFormat.type;

      if (type !== 'text' && type !== 'json') {
        validationResult.errors.push({
          code: AgentExceptionCode.INVALID_AGENT_INPUT,
          message: t`Response format type must be either "text" or "json"`,
          userFriendlyMessage: msg`Invalid response format type`,
        });
      }

      if (type === 'json' && !isDefined(responseFormat.schema)) {
        validationResult.errors.push({
          code: AgentExceptionCode.INVALID_AGENT_INPUT,
          message: t`Response format with type "json" must include a schema`,
          userFriendlyMessage: msg`JSON response format requires a schema`,
        });
      }

      if (
        type === 'text' &&
        isDefined((responseFormat as unknown as AgentJsonResponseFormat).schema)
      ) {
        validationResult.errors.push({
          code: AgentExceptionCode.INVALID_AGENT_INPUT,
          message: t`Response format with type "text" should not include a schema`,
          userFriendlyMessage: msg`Text response format should not have a schema`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatAgentDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatAgentMaps },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<FlatAgent> {
    const validationResult: FailedFlatEntityValidation<FlatAgent> = {
      type: 'delete_agent',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        name: flatEntityToValidate.name,
      },
    };

    const existingAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: flatAgentMaps,
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
      existingAgent.isCustom === false &&
      isDefined(existingAgent.standardId)
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
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatAgentMaps },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<FlatAgent> {
    const validationResult: FailedFlatEntityValidation<FlatAgent> = {
      type: 'update_agent',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const fromFlatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: flatAgentMaps,
    });

    if (!isDefined(fromFlatAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent not found`,
        userFriendlyMessage: msg`Agent not found`,
      });

      return validationResult;
    }

    // Check if agent is a standard (non-custom) agent and cannot be edited
    if (
      fromFlatAgent.isCustom === false &&
      isDefined(fromFlatAgent.standardId)
    ) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_IS_STANDARD,
        message: t`Cannot update standard agent`,
        userFriendlyMessage: msg`Cannot update standard agent`,
      });
    }

    return validationResult;
  }
}
