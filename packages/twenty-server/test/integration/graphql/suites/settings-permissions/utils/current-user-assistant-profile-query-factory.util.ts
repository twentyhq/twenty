import gql from 'graphql-tag';
import { WORKSPACE_ASSISTANT_PROFILE_FRAGMENT } from 'test/integration/graphql/suites/settings-permissions/utils/workspace-assistant-profile-fragment';

export const currentUserAssistantProfileQueryFactory = () => ({
  query: gql`
    ${WORKSPACE_ASSISTANT_PROFILE_FRAGMENT}
    query CurrentUserAssistantProfileSettings {
      currentUser {
        currentWorkspace {
          ...WorkspaceAssistantProfile
        }
      }
    }
  `,
});
