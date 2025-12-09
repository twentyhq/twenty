import { msg } from '@lingui/core/macro';

import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertFormStepIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-form-step-is-valid.util';

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
      {
        userFriendlyMessage: msg`Cannot activate non-draft or non-last-published version`,
      },
    );
  }
}

function assertVersionIsValid(workflowVersion: WorkflowVersionWorkspaceEntity) {
  if (!workflowVersion.trigger) {
    throw new WorkflowTriggerException(
      'Workflow version does not contain trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      {
        userFriendlyMessage: msg`Workflow version does not contain trigger`,
      },
    );
  }

  if (!workflowVersion.trigger.type) {
    throw new WorkflowTriggerException(
      'No trigger type provided',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No trigger type provided`,
      },
    );
  }

  if (!workflowVersion.steps || workflowVersion.steps.length === 0) {
    throw new WorkflowTriggerException(
      'No steps provided in workflow version',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No steps provided in workflow version`,
      },
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        {
          userFriendlyMessage: msg`Invalid trigger type for enabling workflow trigger`,
        },
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertCronTriggerSettingsAreValid(settings: any) {
  if (!settings?.type) {
    throw new WorkflowTriggerException(
      'No setting type provided in cron trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No setting type provided in cron trigger`,
      },
    );
  }
  switch (settings.type) {
    case 'CUSTOM': {
      if (!settings.pattern) {
        throw new WorkflowTriggerException(
          'No pattern provided in CUSTOM cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`No pattern provided in CUSTOM cron trigger`,
          },
        );
      }

      return;
    }

    case 'DAYS': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`No schedule provided in cron trigger`,
          },
        );
      }
      if (settings.schedule.day <= 0) {
        throw new WorkflowTriggerException(
          'Invalid day value. Should be integer greater than 1',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid day value. Should be integer greater than 1`,
          },
        );
      }
      if (settings.schedule.hour < 0 || settings.schedule.hour > 23) {
        throw new WorkflowTriggerException(
          'Invalid hour value. Should be integer between 0 and 23',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid hour value. Should be integer between 0 and 23`,
          },
        );
      }
      if (settings.schedule.minute < 0 || settings.schedule.minute > 59) {
        throw new WorkflowTriggerException(
          'Invalid minute value. Should be integer between 0 and 59',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid minute value. Should be integer between 0 and 59`,
          },
        );
      }

      return;
    }

    case 'HOURS': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid hour value. Should be integer greater than 1`,
          },
        );
      }
      if (settings.schedule.hour <= 0) {
        throw new WorkflowTriggerException(
          'Invalid hour value. Should be integer greater than 1',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid hour value. Should be integer greater than 1`,
          },
        );
      }

      if (settings.schedule.minute < 0 || settings.schedule.minute > 59) {
        throw new WorkflowTriggerException(
          'Invalid minute value. Should be integer between 0 and 59',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid minute value. Should be integer between 0 and 59`,
          },
        );
      }

      return;
    }

    case 'MINUTES': {
      if (!settings.schedule) {
        throw new WorkflowTriggerException(
          'No schedule provided in cron trigger',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: msg`Invalid minute value. Should be integer greater than 1`,
          },
        );
      }

      if (settings.schedule.minute <= 0 || settings.schedule.minute > 60) {
        const errorMessage =
          settings.schedule.minute <= 0
            ? msg`Invalid minute value. Should be integer greater than 1`
            : msg`Minute value cannot exceed 60. For intervals greater than 60 minutes, use the "Hours" trigger type or a custom cron expression`;

        throw new WorkflowTriggerException(
          settings.schedule.minute <= 0
            ? 'Invalid minute value. Should be integer greater than 1'
            : 'Invalid minute value. Cannot exceed 60. For intervals greater than 60 minutes, use the "Hours" trigger type or a custom cron expression',
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
          {
            userFriendlyMessage: errorMessage,
          },
        );
      }

      return;
    }

    default:
      throw new WorkflowTriggerException(
        'Invalid setting type provided in cron trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        {
          userFriendlyMessage: msg`Invalid setting type provided in cron trigger`,
        },
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertDatabaseEventTriggerSettingsAreValid(settings: any) {
  if (!settings?.eventName) {
    throw new WorkflowTriggerException(
      'No event name provided in database event trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No event name provided in database event trigger`,
      },
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
