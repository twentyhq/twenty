import { gql } from 'graphql-tag';

import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { WORKSPACE_DATA_EXPORT_FIELDS } from 'test/integration/workspace-data-export/constants/workspace-data-export-fields.constant';
import {
  type WorkspaceDataExportGraphqlError,
  type WorkspaceDataExportPayload,
} from 'test/integration/workspace-data-export/types/workspace-data-export-payload.type';

const CREATE_WORKSPACE_DATA_EXPORT = gql`
  mutation CreateWorkspaceDataExport($workspaceId: UUID!) {
    createWorkspaceDataExport(workspaceId: $workspaceId) {
      ${WORKSPACE_DATA_EXPORT_FIELDS}
    }
  }
`;

export const createWorkspaceDataExport = async (
  workspaceId: string,
): Promise<{
  dataExport: WorkspaceDataExportPayload | undefined;
  errors: WorkspaceDataExportGraphqlError[] | undefined;
}> => {
  const response = await makeAdminPanelApiRequest({
    query: CREATE_WORKSPACE_DATA_EXPORT,
    variables: { workspaceId },
  });

  return {
    dataExport: response.body.data?.createWorkspaceDataExport,
    errors: response.body.errors,
  };
};
