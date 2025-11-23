import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentExceptionCode } from 'src/engine/metadata-modules/agent/agent.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

@Injectable()
export class FlatAgentValidatorService {
  constructor() {}

  public validateFlatAgentUpdate({
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
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

    const existingFlatAgent = optimisticFlatAgentMaps.byId[flatEntityId];

    if (!isDefined(existingFlatAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent not found`,
        userFriendlyMessage: msg`Agent not found`,
      });
    }

    return validationResult;
  }

  public validateFlatAgentDeletion({
    flatEntityToValidate: { id: agentIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): FailedFlatEntityValidation<FlatAgent> {
    const validationResult: FailedFlatEntityValidation<FlatAgent> = {
      type: 'delete_agent',
      errors: [],
      flatEntityMinimalInformation: {
        id: agentIdToDelete,
      },
    };

    const existingFlatAgent = optimisticFlatAgentMaps.byId[agentIdToDelete];

    if (!isDefined(existingFlatAgent)) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent not found`,
        userFriendlyMessage: msg`Agent not found`,
      });
    }

    return validationResult;
  }

  public async validateFlatAgentCreation({
    flatEntityToValidate: flatAgentToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentMaps: optimisticFlatAgentMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agent
  >): Promise<FailedFlatEntityValidation<FlatAgent>> {
    const validationResult: FailedFlatEntityValidation<FlatAgent> = {
      type: 'create_agent',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatAgentToValidate.id,
      },
    };

    if (isDefined(optimisticFlatAgentMaps.byId[flatAgentToValidate.id])) {
      validationResult.errors.push({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: t`Agent with same id already exists`,
        userFriendlyMessage: msg`Agent already exists`,
      });
    }

    return validationResult;
  }
}

