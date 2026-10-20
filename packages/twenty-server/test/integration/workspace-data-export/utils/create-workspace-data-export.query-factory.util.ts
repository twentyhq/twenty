import { gql } from 'graphql-tag';

import { WORKSPACE_DATA_EXPORT_FIELDS } from 'test/integration/workspace-data-export/constants/workspace-data-export-fields.constant';

export const createWorkspaceDataExportQueryFactory = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  return {
    query: gql`
      mutation CreateWorkspaceDataExport($workspaceId: UUID!) {
        createWorkspaceDataExport(workspaceId: $workspaceId) {
          ${WORKSPACE_DATA_EXPORT_FIELDS}
        }
      }
    `,
    variables: { workspaceId },
  };
};
