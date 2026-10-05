import { msg, t } from '@lingui/core/macro';
import { isBoolean, isNonEmptyString, isNull, isString } from '@sniptt/guards';
import { CronExpressionParser } from 'cron-parser';
import {
  AGENT_TRIGGER_TYPES,
  type AgentTrigger,
} from 'twenty-shared/application';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { AGENT_DATABASE_EVENT_TRIGGER_EVENT_NAME_PATTERN } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-database-event-trigger-event-name-pattern.const';
import { AGENT_TRIGGER_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-trigger-limits.const';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type AgentTriggerValidationError = FlatEntityValidationError<AiExceptionCode>;

const buildInvalidTriggerError = (
  message: string,
): AgentTriggerValidationError => ({
  code: AiExceptionCode.INVALID_AGENT_INPUT,
  message,
  userFriendlyMessage: msg`An agent trigger is invalid`,
});

const isValidCronPattern = (pattern: string): boolean => {
  try {
    CronExpressionParser.parse(pattern);

    return true;
  } catch {
    return false;
  }
};

const validateDatabaseEventTriggerSettings = (
  settings: Record<string, unknown>,
): AgentTriggerValidationError[] => {
  const { eventName, updatedFields, batchMode } = settings;

  if (
    !isString(eventName) ||
    !AGENT_DATABASE_EVENT_TRIGGER_EVENT_NAME_PATTERN.test(eventName)
  ) {
    return [
      buildInvalidTriggerError(
        t`Database event triggers need an event name such as "company.created"`,
      ),
    ];
  }

  const errors: AgentTriggerValidationError[] = [];

  if (isDefined(updatedFields)) {
    if (
      !Array.isArray(updatedFields) ||
      !updatedFields.every((fieldName) => isNonEmptyString(fieldName))
    ) {
      errors.push(
        buildInvalidTriggerError(
          t`Watched fields of a database event trigger must be field names`,
        ),
      );
    } else if (!eventName.endsWith('.updated')) {
      errors.push(
        buildInvalidTriggerError(
          t`Watched fields only apply to "updated" database event triggers`,
        ),
      );
    }
  }

  if (isDefined(batchMode) && !isBoolean(batchMode)) {
    errors.push(
      buildInvalidTriggerError(
        t`Batch mode of a database event trigger must be true or false`,
      ),
    );
  }

  return errors;
};

const validateCronTriggerSettings = (
  settings: Record<string, unknown>,
): AgentTriggerValidationError[] => {
  const { pattern } = settings;

  if (!isNonEmptyString(pattern) || !isValidCronPattern(pattern)) {
    return [
      buildInvalidTriggerError(
        t`Cron triggers need a valid cron pattern such as "0 9 * * 1"`,
      ),
    ];
  }

  return [];
};

const validateAgentTrigger = (
  trigger: unknown,
): AgentTriggerValidationError[] => {
  if (!isPlainObject(trigger)) {
    return [buildInvalidTriggerError(t`Each agent trigger must be an object`)];
  }

  const { id, type, isActive, instructions, settings } = trigger;
  const errors: AgentTriggerValidationError[] = [];

  if (!isString(id) || !isValidUuid(id)) {
    errors.push(buildInvalidTriggerError(t`Agent trigger ids must be UUIDs`));
  }

  if (!isBoolean(isActive)) {
    errors.push(
      buildInvalidTriggerError(t`Agent trigger isActive must be true or false`),
    );
  }

  if (!isNull(instructions) && !isString(instructions)) {
    errors.push(
      buildInvalidTriggerError(
        t`Agent trigger instructions must be text or null`,
      ),
    );
  }

  if (
    isString(instructions) &&
    instructions.length > AGENT_TRIGGER_LIMITS.MAX_INSTRUCTIONS_LENGTH
  ) {
    const maxLength = AGENT_TRIGGER_LIMITS.MAX_INSTRUCTIONS_LENGTH;

    errors.push(
      buildInvalidTriggerError(
        t`Agent trigger instructions cannot exceed ${maxLength} characters`,
      ),
    );
  }

  if (!isPlainObject(settings)) {
    errors.push(
      buildInvalidTriggerError(t`Agent trigger settings must be an object`),
    );

    return errors;
  }

  switch (type) {
    case 'DATABASE_EVENT':
      return [...errors, ...validateDatabaseEventTriggerSettings(settings)];
    case 'CRON':
      return [...errors, ...validateCronTriggerSettings(settings)];
    default: {
      const supportedTypes = AGENT_TRIGGER_TYPES.join(', ');

      return [
        ...errors,
        buildInvalidTriggerError(
          t`Agent trigger type must be one of: ${supportedTypes}`,
        ),
      ];
    }
  }
};

export const validateAgentTriggers = ({
  triggers,
}: {
  triggers: AgentTrigger[];
}): AgentTriggerValidationError[] => {
  if (!Array.isArray(triggers)) {
    return [buildInvalidTriggerError(t`Agent triggers must be a list`)];
  }

  const maxTriggers = AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT;

  if (triggers.length > maxTriggers) {
    return [
      buildInvalidTriggerError(
        t`An agent cannot have more than ${maxTriggers} triggers`,
      ),
    ];
  }

  const errors = triggers.flatMap((trigger) => validateAgentTrigger(trigger));

  const triggerIds = triggers.map((trigger) => trigger.id);

  if (new Set(triggerIds).size !== triggerIds.length) {
    errors.push(buildInvalidTriggerError(t`Agent trigger ids must be unique`));
  }

  return errors;
};
