import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export const ACTIVE_AND_DRAFT_STATUSES = [
  WorkflowStatus.ACTIVE,
  WorkflowStatus.DRAFT,
];

export const DEACTIVATED_AND_DRAFT_STATUSES = [
  WorkflowStatus.DEACTIVATED,
  WorkflowStatus.DRAFT,
];

export const ACTIVE_STATUSES = [WorkflowStatus.ACTIVE];

export const DEACTIVATED_STATUSES = [WorkflowStatus.DEACTIVATED];

export const DRAFT_STATUSES = [WorkflowStatus.DRAFT];

export const NO_STATUSES = [];
