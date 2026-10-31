export type AiRunEventType =
  | 'RUN_STARTED'
  | 'MESSAGE'
  | 'TOOL_CALL'
  | 'TOOL_RESULT'
  | 'INTERACTION'
  | 'RUN_COMPLETED'
  | 'RUN_FAILED';

export type AiRunUsage = { inputTokens: number; outputTokens: number };

type AiRunEventOf<TType extends AiRunEventType, TData = object> = {
  // stable across the list and the stream, so it doubles as a cursor
  id: string;
  runId: string;
  type: TType;
  createdAt: string;
} & TData;

export type AiRunEvent =
  | AiRunEventOf<'RUN_STARTED'>
  | AiRunEventOf<'MESSAGE', { role: 'user' | 'assistant'; text: string }>
  | AiRunEventOf<
      'TOOL_CALL',
      { toolCallId: string; toolName: string; input: unknown }
    >
  | AiRunEventOf<
      'TOOL_RESULT',
      { toolCallId: string; output: unknown; isError: boolean }
    >
  // the run asks a person or waits on an event; the answer comes as its TOOL_RESULT
  | AiRunEventOf<
      'INTERACTION',
      { toolCallId: string; toolName: string; input: unknown }
    >
  | AiRunEventOf<'RUN_COMPLETED', { usage: AiRunUsage | null }>
  | AiRunEventOf<'RUN_FAILED', { error: string; usage: AiRunUsage | null }>;

export type AiRunEventsInput = (
  | { runId: string; agentUniversalIdentifier?: never; threadKey?: never }
  | { runId?: never; agentUniversalIdentifier: string; threadKey: string }
) & {
  // an event id: only the events after it are returned
  after?: string;
};
