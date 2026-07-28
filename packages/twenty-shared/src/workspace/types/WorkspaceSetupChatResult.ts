export type WorkspaceSetupChatResult =
  | {
      outcome: 'started' | 'alreadyStarted';
      threadId: string;
    }
  | {
      outcome: 'unavailable';
      threadId: null;
    };
