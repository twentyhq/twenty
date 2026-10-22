export type AgentRunEventTextContent = { type: 'text'; text: string };

export type AgentRunStopReason = 'end_turn' | 'requires_action';

export type AgentRunEventError = { code: string; message: string };

// What happens in an agent run's conversation. An event keeps its id between the listed history
// and the live stream, so a client reading both can drop the ones it already has
export type AgentRunEvent =
  | { id: string; type: 'user.message'; content: AgentRunEventTextContent[] }
  | { id: string; type: 'agent.message'; content: AgentRunEventTextContent[] }
  | {
      id: string;
      type: 'agent.tool_use';
      toolUseId: string;
      name: string;
      input: unknown;
    }
  | {
      id: string;
      type: 'agent.tool_result';
      toolUseId: string;
      output: unknown;
      isError: boolean;
    }
  | { id: string; type: 'session.status_running' }
  | { id: string; type: 'session.status_idle'; stopReason: AgentRunStopReason }
  | { id: string; type: 'session.error'; error: AgentRunEventError };
