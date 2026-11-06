import gql from 'graphql-tag';

import { type AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';

export const saveDirectMessageAssistantModeOperationFactory = (
  mode: AiChatAssistantMode,
) => ({
  query: gql`
    mutation SaveDirectMessageAssistantMode($data: UpdateWorkspaceInput!) {
      updateWorkspace(data: $data) {
        aiChatDirectMessageAssistantMode
      }
    }
  `,
  variables: { data: { aiChatDirectMessageAssistantMode: mode } },
});
