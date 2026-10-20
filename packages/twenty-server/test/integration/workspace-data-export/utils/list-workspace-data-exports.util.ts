import { gql } from 'graphql-tag';

import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { WORKSPACE_DATA_EXPORT_FIELDS } from 'test/integration/workspace-data-export/constants/workspace-data-export-fields.constant';
import { type WorkspaceDataExportPayload } from 'test/integration/workspace-data-export/types/workspace-data-export-payload.type';

const WORKSPACE_DATA_EXPORTS = gql`
  query WorkspaceDataExports($workspaceId: UUID!) {
    workspaceDataExports(workspaceId: $workspaceId) {
      ${WORKSPACE_DATA_EXPORT_FIELDS}
    }
  }
`;

export const listWorkspaceDataExports = async (
  workspaceId: string,
): Promise<WorkspaceDataExportPayload[]> => {
  const response = await makeAdminPanelApiRequest({
    query: WORKSPACE_DATA_EXPORTS,
    variables: { workspaceId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workspaceDataExports;
};
