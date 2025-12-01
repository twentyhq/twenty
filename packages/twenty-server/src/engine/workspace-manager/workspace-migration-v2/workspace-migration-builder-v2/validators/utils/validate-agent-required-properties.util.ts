import { isNonEmptyString } from '@sniptt/guards';
import { msg, t } from '@lingui/core/macro';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateAgentRequiredProperties = ({
  flatAgent,
}: {
  flatAgent: FlatAgent;
}): FlatEntityValidationError<AgentExceptionCode>[] => {
  const errors: FlatEntityValidationError<AgentExceptionCode>[] = [];

  if (!isNonEmptyString(flatAgent.label)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Label cannot be empty`,
      userFriendlyMessage: msg`Label cannot be empty`,
    });
  }

  if (!isNonEmptyString(flatAgent.prompt)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Prompt cannot be empty`,
      userFriendlyMessage: msg`Prompt cannot be empty`,
    });
  }

  if (!isNonEmptyString(flatAgent.modelId)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Model ID cannot be empty`,
      userFriendlyMessage: msg`Model ID cannot be empty`,
    });
  }

  return errors;
};

