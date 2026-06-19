import { msg, t } from '@lingui/core/macro';
import { isValidAgentResponseSchemaPropertyKey } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import {
  type AgentJsonResponseFormat,
  type AgentResponseFormat,
} from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateAgentResponseFormat = ({
  responseFormat,
}: {
  responseFormat: AgentResponseFormat;
}): FlatEntityValidationError<AiExceptionCode>[] => {
  const errors: FlatEntityValidationError<AiExceptionCode>[] = [];
  const type = responseFormat.type;

  if (type !== 'text' && type !== 'json') {
    errors.push({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format type must be either "text" or "json"`,
      userFriendlyMessage: msg`Invalid response format type`,
    });
  }

  if (type === 'json' && !isDefined(responseFormat.schema)) {
    errors.push({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format with type "json" must include a schema`,
      userFriendlyMessage: msg`JSON response format requires a schema`,
    });
  }

  if (type === 'json' && isDefined(responseFormat.schema)) {
    const invalidPropertyNames = Object.keys(
      responseFormat.schema.properties ?? {},
    ).filter(
      (propertyName) => !isValidAgentResponseSchemaPropertyKey(propertyName),
    );

    if (isNonEmptyArray(invalidPropertyNames)) {
      errors.push({
        code: AiExceptionCode.INVALID_AGENT_INPUT,
        message: t`Output field names must use only letters, numbers, underscores, dots or hyphens and be at most 64 characters: ${invalidPropertyNames.join(', ')}`,
        userFriendlyMessage: msg`Output field names can only contain letters, numbers, underscores, dots or hyphens (max 64 characters).`,
      });
    }
  }

  if (
    type === 'text' &&
    isDefined((responseFormat as unknown as AgentJsonResponseFormat).schema)
  ) {
    errors.push({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: t`Response format with type "text" should not include a schema`,
      userFriendlyMessage: msg`Text response format should not have a schema`,
    });
  }

  return errors;
};
