import gql from 'graphql-tag';

export const invalidWorkspaceAssistantProfileUpdateQueryFactory = () => ({
  query: gql`
    mutation {
      updateWorkspace(
        data: {
          displayName: "Rejected workspace edit"
          aiChatAssistantProfile: { avatarColor: "unsupported" }
        }
      ) {
        id
      }
    }
  `,
});
