import gql from 'graphql-tag';

import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

export const updateWorkspaceOperationFactory = ({
  data,
}: {
  data: UpdateWorkspaceInput;
}) => ({
  query: gql`
    mutation UpdateWorkspace($data: UpdateWorkspaceInput!) {
      updateWorkspace(data: $data) {
        id
      }
    }
  `,
  variables: { data },
});
