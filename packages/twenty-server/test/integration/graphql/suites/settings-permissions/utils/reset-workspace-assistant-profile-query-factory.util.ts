import gql from 'graphql-tag';

export const resetWorkspaceAssistantProfileQueryFactory = () => ({
  query: gql`
    mutation ResetWorkspaceAssistantProfile {
      resetAiChatAssistantProfile {
        displayName
        avatarShape
        avatarColor
        avatarFace
        isAvatarAnimated
      }
    }
  `,
});
