// a run's channel carries only that run's turn, so it has no thread to check, filter or reap
export type AgentChatChannel = {
  kind: 'thread' | 'run';
  channelId: string;
};
