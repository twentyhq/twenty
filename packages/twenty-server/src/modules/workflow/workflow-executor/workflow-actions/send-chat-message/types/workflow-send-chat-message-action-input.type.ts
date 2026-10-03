export type WorkflowSendChatMessageActionInput = {
  workspaceMemberId: string;
  title: string;
  text: string;
  toolCall?: {
    toolName: string;
    arguments: Record<string, object | string | number | boolean | null>;
  };
};
