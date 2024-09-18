import isEqual from 'lodash.isequal';

import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  ACTIVE_AND_DRAFT_STATUSES,
  ACTIVE_STATUSES,
  DEACTIVATED_AND_DRAFT_STATUSES,
  DEACTIVATED_STATUSES,
  DRAFT_STATUSES,
} from 'src/modules/workflow/workflow-status/constants/workflow-status.constants';
import { WorkflowStatusCombination } from 'src/modules/workflow/workflow-status/enums/workflow-status.enum';

export const getStatusCombinationFromArray = (
  statuses: WorkflowStatus[],
): WorkflowStatusCombination => {
  if (isEqual(statuses, ACTIVE_AND_DRAFT_STATUSES)) {
    return WorkflowStatusCombination.ACTIVE_AND_DRAFT;
  }

  if (isEqual(statuses, ACTIVE_STATUSES)) {
    return WorkflowStatusCombination.ACTIVE;
  }

  if (isEqual(statuses, DEACTIVATED_AND_DRAFT_STATUSES)) {
    return WorkflowStatusCombination.DEACTIVATED_AND_DRAFT;
  }

  if (isEqual(statuses, DEACTIVATED_STATUSES)) {
    return WorkflowStatusCombination.DEACTIVATED;
  }

  if (isEqual(statuses, DRAFT_STATUSES)) {
    return WorkflowStatusCombination.DRAFT;
  }

  return WorkflowStatusCombination.NO_STATUSES;
};
