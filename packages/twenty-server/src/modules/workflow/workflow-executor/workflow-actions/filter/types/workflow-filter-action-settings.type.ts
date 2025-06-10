import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowFilterActionSettings = BaseWorkflowActionSettings & {
  input: {
    filter: Partial<ObjectRecordFilter>;
  };
};
