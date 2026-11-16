import gql from 'graphql-tag';
import { WORKSPACE_ASSISTANT_PROFILE_FRAGMENT } from 'test/integration/graphql/suites/settings-permissions/utils/workspace-assistant-profile-fragment';

import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

export const updateWorkspaceAssistantProfileQueryFactory = ({
  data,
}: {
  data: UpdateWorkspaceInput;
}) => ({
  query: gql`
    ${WORKSPACE_ASSISTANT_PROFILE_FRAGMENT}
    mutation UpdateWorkspaceAssistantProfile($data: UpdateWorkspaceInput!) {
      updateWorkspace(data: $data) {
        ...WorkspaceAssistantProfile
      }
    }
  `,
  variables: { data },
});
