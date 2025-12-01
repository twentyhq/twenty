import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AgentExceptionCode } from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import {
  type AgentResponseFormat,
  type AgentJsonResponseFormat,
} from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateAgentResponseFormat = ({
  responseFormat,
}: {
  responseFormat: AgentResponseFormat;
}): FlatEntityValidationError<AgentExceptionCode>[] => {
  const errors: FlatEntityValidationError<AgentExceptionCode>[] = [];
  const type = responseFormat.type;

  if (type !== 'text' && type !== 'json') {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format type must be either "text" or "json"`,
      userFriendlyMessage: msg`Invalid response format type`,
    });
  }

  if (type === 'json' && !isDefined(responseFormat.schema)) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format with type "json" must include a schema`,
      userFriendlyMessage: msg`JSON response format requires a schema`,
    });
  }

  if (
    type === 'text' &&
    isDefined((responseFormat as unknown as AgentJsonResponseFormat).schema)
  ) {
    errors.push({
      code: AgentExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format with type "text" should not include a schema`,
      userFriendlyMessage: msg`Text response format should not have a schema`,
    });
  }

  return errors;
};
