import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  ACTIVE_AND_DRAFT_STATUSES,
  ACTIVE_STATUSES,
  DEACTIVATED_AND_DRAFT_STATUSES,
  DEACTIVATED_STATUSES,
  DRAFT_STATUSES,
  NO_STATUSES,
} from 'src/modules/workflow/workflow-status/constants/workflow-status.constants';
import { WorkflowStatusCombination } from 'src/modules/workflow/workflow-status/enums/workflow-status.enum';

export const getWorkflowStatusesFromCombination = (
  combination: WorkflowStatusCombination,
): WorkflowStatus[] => {
  switch (combination) {
    case WorkflowStatusCombination.ACTIVE:
      return ACTIVE_STATUSES;
    case WorkflowStatusCombination.DRAFT:
      return DRAFT_STATUSES;
    case WorkflowStatusCombination.DEACTIVATED:
      return DEACTIVATED_STATUSES;
    case WorkflowStatusCombination.ACTIVE_AND_DRAFT:
      return ACTIVE_AND_DRAFT_STATUSES;
    case WorkflowStatusCombination.DEACTIVATED_AND_DRAFT:
      return DEACTIVATED_AND_DRAFT_STATUSES;
    case WorkflowStatusCombination.NO_STATUSES:
      return NO_STATUSES;
  }
};
