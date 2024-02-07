import { WorkspaceHealthIssueType } from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';

export const isWorkspaceHealthNullableIssue = (
  type: WorkspaceHealthIssueType,
): type is
  | WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT
  | WorkspaceHealthIssueType.RELATION_NULLABILITY_CONFLICT => {
  return type === WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT ||
    type === WorkspaceHealthIssueType.RELATION_NULLABILITY_CONFLICT
    ? true
    : false;
};
