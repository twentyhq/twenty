import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertCronPatternIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-cron-pattern-is-valid.util';
import { assertWaitForEventStepIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-wait-for-event-step-is-valid.util';
import { assertFormStepIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-form-step-is-valid.util';

export function assertVersionCanBeActivated(
  workflowVersion: Pick<
    WorkflowVersionWorkspaceEntity,
    'id' | 'status' | 'trigger' | 'steps'
  >,
  workflow: Pick<WorkflowEntity, 'lastPublishedVersionId'>,
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

function assertVersionIsValid(
  workflowVersion: Pick<
    WorkflowVersionWorkspaceEntity,
    'id' | 'status' | 'trigger' | 'steps'
  >,
) {
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
  // oxlint-disable-next-line typescript/no-explicit-any
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

// oxlint-disable-next-line typescript/no-explicit-any
function assertCronTriggerSettingsAreValid(settings: any) {
  if (!isNonEmptyString(settings?.pattern)) {
    throw new WorkflowTriggerException(
      'No pattern provided in cron trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      {
        userFriendlyMessage: msg`No pattern provided in cron trigger`,
      },
    );
  }

  assertCronPatternIsValid(settings.pattern);
}

// oxlint-disable-next-line typescript/no-explicit-any
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
    case WorkflowActionType.WAIT_FOR_EVENT:
      assertWaitForEventStepIsValid(step.settings);
      break;
    default:
      break;
  }
}
