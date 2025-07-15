import { StepFilter, StepFilterGroup } from 'twenty-shared/types';

import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowFilterActionSettings = BaseWorkflowActionSettings & {
  input: {
    stepFilterGroups?: StepFilterGroup[];
    stepFilters?: StepFilter[];
  };
};
