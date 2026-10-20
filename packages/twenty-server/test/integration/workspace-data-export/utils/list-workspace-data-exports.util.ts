import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { type WorkspaceDataExportPayload } from 'test/integration/workspace-data-export/types/workspace-data-export-payload.type';
import { workspaceDataExportsQueryFactory } from 'test/integration/workspace-data-export/utils/workspace-data-exports.query-factory.util';

export const listWorkspaceDataExports = async (
  workspaceId: string,
): Promise<WorkspaceDataExportPayload[]> => {
  const response = await makeAdminPanelApiRequest(
    workspaceDataExportsQueryFactory({ workspaceId }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workspaceDataExports;
};
