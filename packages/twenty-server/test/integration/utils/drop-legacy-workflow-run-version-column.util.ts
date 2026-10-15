import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

export const dropLegacyWorkflowRunVersionColumn = async (
  workspaceId: string,
): Promise<void> => {
  await global.testDataSource.query(
    `ALTER TABLE "${getWorkspaceSchemaName(workspaceId)}"."workflowRun" DROP COLUMN IF EXISTS "workflowVersionId"`,
  );
};
