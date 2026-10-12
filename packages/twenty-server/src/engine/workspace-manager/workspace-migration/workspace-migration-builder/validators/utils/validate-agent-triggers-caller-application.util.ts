import { msg, t } from '@lingui/core/macro';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

// Triggers start runs on their own, so only the agent's application may schedule them
export const validateAgentTriggersCallerApplication = ({
  callerApplicationUniversalIdentifier,
  agentApplicationUniversalIdentifier,
}: {
  callerApplicationUniversalIdentifier: string;
  agentApplicationUniversalIdentifier: string;
}): FlatEntityValidationError<AiExceptionCode>[] => {
  if (
    callerApplicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier ||
    callerApplicationUniversalIdentifier === agentApplicationUniversalIdentifier
  ) {
    return [];
  }

  return [
    {
      code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
      message: t`Only the application that owns this agent can change its triggers`,
      userFriendlyMessage: msg`Only the application that owns this agent can change its triggers`,
    },
  ];
};
