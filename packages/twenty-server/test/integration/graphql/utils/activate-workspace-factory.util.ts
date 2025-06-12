import { gql } from '@apollo/client';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';


export const activateWorkspaceOperationFactory = (input: ActivateWorkspaceInput) => ({
  query: gql`
    mutation ActivateWorkspace($input: ActivateWorkspaceInput!) {
      activateWorkspace(data: $input) {
        id
      }
    }
  `,
  variables: {
    input,
  },
});