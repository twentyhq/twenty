import gql from 'graphql-tag';

export const assistantSystemPromptPreviewQueryFactory = () => ({
  query: gql`
    query GetAssistantSystemPromptPreview {
      getAiSystemPromptPreview {
        sections {
          title
          content
        }
      }
    }
  `,
});
