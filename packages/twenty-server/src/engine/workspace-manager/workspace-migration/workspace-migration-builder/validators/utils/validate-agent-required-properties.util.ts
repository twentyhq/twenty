import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type UniversalFlatAgent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateAgentRequiredPropertiesArgs = {
  flatAgent: UniversalFlatAgent;
  updatedProperties?: Partial<UniversalFlatAgent>;
};

export const validateAgentRequiredProperties = ({
  flatAgent,
  updatedProperties,
}: ValidateAgentRequiredPropertiesArgs): FlatEntityValidationError<AgentExceptionCode>[] => {
  const errors: FlatEntityValidationError<AgentExceptionCode>[] = [];

  // For updates, only validate properties that are being changed
  const isUpdate = updatedProperties !== undefined;
  const shouldValidateLabel = !isUpdate || 'label' in updatedProperties;
  const shouldValidatePrompt = !isUpdate || 'prompt' in updatedProperties;
  const shouldValidateModelId = !isUpdate || 'modelId' in updatedProperties;

  if (shouldValidateLabel && !isNonEmptyString(flatAgent.label)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Label cannot be empty`,
      userFriendlyMessage: msg`Label cannot be empty`,
    });
  }

  if (shouldValidatePrompt && !isNonEmptyString(flatAgent.prompt)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Prompt cannot be empty`,
      userFriendlyMessage: msg`Prompt cannot be empty`,
    });
  }

  if (shouldValidateModelId && !isNonEmptyString(flatAgent.modelId)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Model ID cannot be empty`,
      userFriendlyMessage: msg`Model ID cannot be empty`,
    });
  }

  return errors;
};
