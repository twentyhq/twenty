import { WorkspaceHealthIssueType } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';

export const isWorkspaceHealthNullableIssue = (
  type: WorkspaceHealthIssueType,
): type is WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT => {
  return type === WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT;
};

export const isWorkspaceHealthTypeIssue = (
  type: WorkspaceHealthIssueType,
): type is WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT => {
  return type === WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT;
};

export const isWorkspaceHealthDefaultValueIssue = (
  type: WorkspaceHealthIssueType,
): type is WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT => {
  return type === WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT;
};

export const isWorkspaceHealthTargetColumnMapIssue = (
  type: WorkspaceHealthIssueType,
): type is WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID => {
  return type === WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID;
};
