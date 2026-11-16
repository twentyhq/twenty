import gql from 'graphql-tag';

export const WORKSPACE_ASSISTANT_PROFILE_FRAGMENT = gql`
  fragment WorkspaceAssistantProfile on Workspace {
    id
    displayName
    aiChatAssistantProfile {
      displayName
      avatarShape
      avatarColor
      avatarFace
      isAvatarAnimated
    }
  }
`;
