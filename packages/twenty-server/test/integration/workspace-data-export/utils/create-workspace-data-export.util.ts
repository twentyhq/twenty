import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import {
  type WorkspaceDataExportGraphqlError,
  type WorkspaceDataExportPayload,
} from 'test/integration/workspace-data-export/types/workspace-data-export-payload.type';
import { createWorkspaceDataExportQueryFactory } from 'test/integration/workspace-data-export/utils/create-workspace-data-export.query-factory.util';

export const createWorkspaceDataExport = async (
  workspaceId: string,
): Promise<{
  dataExport: WorkspaceDataExportPayload | undefined;
  errors: WorkspaceDataExportGraphqlError[] | undefined;
}> => {
  const response = await makeAdminPanelApiRequest(
    createWorkspaceDataExportQueryFactory({ workspaceId }),
  );

  return {
    dataExport: response.body.data?.createWorkspaceDataExport,
    errors: response.body.errors,
  };
};
