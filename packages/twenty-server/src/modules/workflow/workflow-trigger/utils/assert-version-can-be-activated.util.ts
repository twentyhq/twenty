import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
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
  if (settings.type === 'CUSTOM' && !settings.pattern) {
    throw new WorkflowTriggerException(
      'No pattern provided in CUSTOM cron trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }
  if (!settings.schedule) {
    throw new WorkflowTriggerException(
      'No schedule provided in cron trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }
  if (settings.type === 'HOURS' && settings.schedule.hour <= 0) {
    throw new WorkflowTriggerException(
      'Invalid hour value. Should be integer greater than 1',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }

  if (
    settings.type === 'HOURS' &&
    (settings.schedule.minute < 0 || settings.schedule.minute > 59)
  ) {
    throw new WorkflowTriggerException(
      'Invalid minute value. Should be integer between 0 and 59',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
    );
  }

  if (settings.type === 'MINUTES' && settings.schedule.minute <= 0) {
    throw new WorkflowTriggerException(
      'Invalid minute value. Should be integer greater than 1',
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
