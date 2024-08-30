import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export enum WorkflowStatusCombination {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  DEACTIVATED = 'DEACTIVATED',
  ACTIVE_AND_DRAFT = 'ACTIVE_AND_DRAFT',
  DEACTIVATED_AND_DRAFT = 'DEACTIVATED_AND_DRAFT',
  NO_STATUSES = 'NO_STATUSES',
}

export const getWorkflowStatusCombinationFromArray = (
  statuses: WorkflowStatus[],
): WorkflowStatusCombination => {
  if (
    statuses.includes(WorkflowStatus.ACTIVE) &&
    statuses.includes(WorkflowStatus.DRAFT)
  ) {
    return WorkflowStatusCombination.ACTIVE_AND_DRAFT;
  }

  if (statuses.includes(WorkflowStatus.ACTIVE)) {
    return WorkflowStatusCombination.ACTIVE;
  }

  if (
    statuses.includes(WorkflowStatus.DEACTIVATED) &&
    statuses.includes(WorkflowStatus.DRAFT)
  ) {
    return WorkflowStatusCombination.DEACTIVATED_AND_DRAFT;
  }

  if (statuses.includes(WorkflowStatus.DEACTIVATED)) {
    return WorkflowStatusCombination.DEACTIVATED;
  }

  if (statuses.includes(WorkflowStatus.DRAFT)) {
    return WorkflowStatusCombination.DRAFT;
  }

  return WorkflowStatusCombination.NO_STATUSES;
};

export const getWorkflowStatusesFromCombination = (
  combination: WorkflowStatusCombination,
): WorkflowStatus[] => {
  switch (combination) {
    case WorkflowStatusCombination.ACTIVE:
      return [WorkflowStatus.ACTIVE];
    case WorkflowStatusCombination.DRAFT:
      return [WorkflowStatus.DRAFT];
    case WorkflowStatusCombination.DEACTIVATED:
      return [WorkflowStatus.DEACTIVATED];
    case WorkflowStatusCombination.ACTIVE_AND_DRAFT:
      return [WorkflowStatus.ACTIVE, WorkflowStatus.DRAFT];
    case WorkflowStatusCombination.DEACTIVATED_AND_DRAFT:
      return [WorkflowStatus.DEACTIVATED, WorkflowStatus.DRAFT];
    case WorkflowStatusCombination.NO_STATUSES:
      return [];
  }
};

export const getNewCombinationFromUpdate = (
  previousCombination: WorkflowStatusCombination,
  statusToRemove?: WorkflowVersionStatus,
  statusToAdd?: WorkflowVersionStatus,
): WorkflowStatusCombination => {
  switch (previousCombination) {
    case WorkflowStatusCombination.ACTIVE_AND_DRAFT:
      if (
        statusToAdd === WorkflowVersionStatus.ACTIVE &&
        statusToRemove === WorkflowVersionStatus.DRAFT
      ) {
        return WorkflowStatusCombination.ACTIVE;
      }
      if (statusToRemove === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.ACTIVE;
      }
      break;
    case WorkflowStatusCombination.DEACTIVATED_AND_DRAFT:
      if (
        statusToRemove === WorkflowVersionStatus.DRAFT &&
        statusToAdd === WorkflowVersionStatus.ACTIVE
      ) {
        return WorkflowStatusCombination.ACTIVE;
      }
      if (statusToRemove === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.DEACTIVATED;
      }
      break;
    case WorkflowStatusCombination.ACTIVE:
      if (
        statusToRemove === WorkflowVersionStatus.ACTIVE &&
        statusToAdd === WorkflowVersionStatus.DEACTIVATED
      ) {
        return WorkflowStatusCombination.DEACTIVATED;
      }
      if (!statusToRemove && statusToAdd === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.ACTIVE_AND_DRAFT;
      }
      break;
    case WorkflowStatusCombination.DEACTIVATED:
      if (
        statusToRemove === WorkflowVersionStatus.DEACTIVATED &&
        statusToAdd === WorkflowVersionStatus.ACTIVE
      ) {
        return WorkflowStatusCombination.ACTIVE;
      }
      if (!statusToRemove && statusToAdd === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.DEACTIVATED_AND_DRAFT;
      }
      break;
    case WorkflowStatusCombination.DRAFT:
      if (
        statusToRemove === WorkflowVersionStatus.DRAFT &&
        statusToAdd === WorkflowVersionStatus.ACTIVE
      ) {
        return WorkflowStatusCombination.ACTIVE;
      }
      if (statusToRemove === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.NO_STATUSES;
      }
      break;
    case WorkflowStatusCombination.NO_STATUSES:
      if (statusToAdd === WorkflowVersionStatus.DRAFT) {
        return WorkflowStatusCombination.DRAFT;
      }
      break;
    default:
      break;
  }

  return previousCombination;
};
