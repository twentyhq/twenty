import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

export const restoreLegacyWorkflowRunVersionColumn = async (
  workspaceId: string,
): Promise<void> => {
  await global.testDataSource.query(
    `ALTER TABLE "${getWorkspaceSchemaName(workspaceId)}"."workflowRun" ADD COLUMN IF NOT EXISTS "workflowVersionId" uuid`,
  );
};
