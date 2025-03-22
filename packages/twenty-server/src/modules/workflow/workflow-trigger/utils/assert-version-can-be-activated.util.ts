import { isNonEmptyString } from '@sniptt/guards';

import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export function assertVersionCanBeActivated(
  workflowVersion: WorkflowVersionWorkspaceEntity,
  workflow: WorkflowWorkspaceEntity,
) {
  assertVersionIsValid(workflowVersion);

  const isLastPublishedVersion =
    workflow.lastPublishedVersionId === workflowVersion.id;

  const isDraft = workflowVersion.status === WorkflowVersionStatus.DRAFT;

  const isLastPublishedVersionDeactivated =
    workflowVersion.status === WorkflowVersionStatus.DEACTIVATED &&
    isLastPublishedVersion;

  if (!isDraft && !isLastPublishedVersionDeactivated) {
    throw new WorkflowTriggerException(
      'Cannot activate non-draft or non-last-published version',
      WorkflowTriggerExceptionCode.INVALID_INPUT,
    );
  }
}

function assertVersionIsValid(workflowVersion: WorkflowVersionWorkspaceEntity) {
  if (!workflowVersion.trigger) {
    throw new WorkflowTriggerException(
      'Workflow version does not contain trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }

  if (!workflowVersion.trigger.type) {
    throw new WorkflowTriggerException(
      'No trigger type provided',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }

  if (!workflowVersion.steps || workflowVersion.steps.length === 0) {
    throw new WorkflowTriggerException(
      'No steps provided in workflow version',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }

  assertTriggerSettingsAreValid(
    workflowVersion.trigger.type,
    workflowVersion.trigger.settings,
  );

  workflowVersion.steps.forEach((step) => {
    assertStepIsValid(step);
  });
}

function assertTriggerSettingsAreValid(
  triggerType: WorkflowTriggerType,
  settings: any,
) {
  switch (triggerType) {
    case WorkflowTriggerType.DATABASE_EVENT:
      assertDatabaseEventTriggerSettingsAreValid(settings);
      break;
    case WorkflowTriggerType.MANUAL:
    case WorkflowTriggerType.WEBHOOK:
      break;
    case WorkflowTriggerType.CRON:
      assertCronTriggerSettingsAreValid(settings);
      break;
    default:
      throw new WorkflowTriggerException(
        'Invalid trigger type for enabling workflow trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
  }
}

function assertCronTriggerSettingsAreValid(settings: any) {
  if (!settings?.type) {
    throw new WorkflowTriggerException(
      'No setting type provided in cron trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }
  switch (settings.type) {
    case 'CUSTOM': {
      if (!settings.pattern) {
        throw new WorkflowTriggerException(
          'No pattern provided in CUSTOM cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      return;
    }

    case 'DAYS': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }
      if (settings.schedule.day <= 0) {
        throw new WorkflowTriggerException(
          'Invalid day value. Should be integer greater than 1',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }
      if (settings.schedule.hour < 0 || settings.schedule.hour > 23) {
        throw new WorkflowTriggerException(
          'Invalid hour value. Should be integer between 0 and 23',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }
      if (settings.schedule.minute < 0 || settings.schedule.minute > 59) {
        throw new WorkflowTriggerException(
          'Invalid minute value. Should be integer between 0 and 59',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      return;
    }

    case 'HOURS': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }
      if (settings.schedule.hour <= 0) {
        throw new WorkflowTriggerException(
          'Invalid hour value. Should be integer greater than 1',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      if (settings.schedule.minute < 0 || settings.schedule.minute > 59) {
        throw new WorkflowTriggerException(
          'Invalid minute value. Should be integer between 0 and 59',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      return;
    }

    case 'MINUTES': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      if (settings.schedule.minute <= 0) {
        throw new WorkflowTriggerException(
          'Invalid minute value. Should be integer greater than 1',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      return;
    }

    default:
      throw new WorkflowTriggerException(
        'Invalid setting type provided in cron trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
  }
}

function assertDatabaseEventTriggerSettingsAreValid(settings: any) {
  if (!settings?.eventName) {
    throw new WorkflowTriggerException(
      'No event name provided in database event trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }
}

function assertStepIsValid(step: WorkflowAction) {
  switch (step.type) {
    case WorkflowActionType.FORM:
      assertFormStepIsValid(step.settings);
      break;
    default:
      break;
  }
}

function assertFormStepIsValid(settings: WorkflowFormActionSettings) {
  if (!settings.input) {
    throw new WorkflowTriggerException(
      'No input provided in form step',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }

  // Check all fields have unique and defined names
  const fieldNames = settings.input.map((fieldMetadata) => fieldMetadata.name);
  const uniqueFieldNames = new Set(fieldNames);

  if (fieldNames.length !== uniqueFieldNames.size) {
    throw new WorkflowTriggerException(
      'Form action fields must have unique names',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }

  // Check all fields have defined labels and types
  settings.input.forEach((fieldMetadata) => {
    if (
      !isNonEmptyString(fieldMetadata.label) ||
      !isNonEmptyString(fieldMetadata.type)
    ) {
      throw new WorkflowTriggerException(
        'Form action fields must have a defined label and type',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }
  });
}
