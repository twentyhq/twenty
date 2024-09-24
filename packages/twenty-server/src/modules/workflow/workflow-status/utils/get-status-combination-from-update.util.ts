import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatusCombination } from 'src/modules/workflow/workflow-status/enums/workflow-status.enum';

export const getStatusCombinationFromUpdate = (
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
