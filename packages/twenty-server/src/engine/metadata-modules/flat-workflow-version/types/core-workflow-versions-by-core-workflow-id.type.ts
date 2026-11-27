import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export type CoreWorkflowVersions = {
  flatWorkflowVersionsInCreationOrder: FlatWorkflowVersion[];
  statuses: WorkflowStatus[];
};

export type CoreWorkflowVersionsByCoreWorkflowId = Partial<
  Record<string, CoreWorkflowVersions>
>;
