import { gql } from 'graphql-tag';

import { WORKSPACE_DATA_EXPORT_FIELDS } from 'test/integration/workspace-data-export/constants/workspace-data-export-fields.constant';

export const workspaceDataExportsQueryFactory = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  return {
    query: gql`
      query WorkspaceDataExports($workspaceId: UUID!) {
        workspaceDataExports(workspaceId: $workspaceId) {
          ${WORKSPACE_DATA_EXPORT_FIELDS}
        }
      }
    `,
    variables: { workspaceId },
  };
};
