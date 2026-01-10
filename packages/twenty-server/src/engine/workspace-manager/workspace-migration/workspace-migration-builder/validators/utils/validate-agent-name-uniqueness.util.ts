import { msg, t } from '@lingui/core/macro';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateAgentNameUniqueness = ({
  name,
  existingFlatAgents,
}: {
  name: string;
  existingFlatAgents: FlatAgent[];
}): FlatEntityValidationError<AgentExceptionCode>[] => {
  const errors: FlatEntityValidationError<AgentExceptionCode>[] = [];

  if (existingFlatAgents.some((agent) => agent.name === name)) {
    errors.push({
      code: AgentExceptionCode.AGENT_ALREADY_EXISTS,
      message: t`Agent with name "${name}" already exists`,
      userFriendlyMessage: msg`An agent with this name already exists`,
    });
  }

  return errors;
};
