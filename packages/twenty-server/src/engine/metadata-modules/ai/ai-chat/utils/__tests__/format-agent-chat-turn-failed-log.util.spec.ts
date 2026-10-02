import { APICallError } from 'ai';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { formatAgentChatTurnFailedLog } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-agent-chat-turn-failed-log.util';

const TURN = {
  threadId: 'thread-id',
  workspaceId: 'workspace-id',
  streamId: 'stream-id',
  model: 'azure-foundry/gpt-5.6-luna@medium',
  failurePhase: 'execution',
  errorCode: 'STREAM_EXECUTION_FAILED',
};

describe('formatAgentChatTurnFailedLog', () => {
  it('surfaces the Postgres code and the cause hidden behind a generic message', () => {
    const error = Object.assign(
      new PostgresException('Data validation error.', '22P05'),
      { cause: new Error('unsupported Unicode escape sequence') },
    );

    expect(formatAgentChatTurnFailedLog({ ...TURN, error })).toBe(
      '[AI_CHAT_TURN_FAILED] threadId=thread-id workspaceId=workspace-id streamId=stream-id ' +
        'model=azure-foundry/gpt-5.6-luna@medium failurePhase=execution errorCode=STREAM_EXECUTION_FAILED ' +
        'postgresCode=22P05 ' +
        'cause="Error: Data validation error. <- Error: unsupported Unicode escape sequence"',
    );
  });

  it('carries the AI SDK error class, status and provider code', () => {
    const error = new APICallError({
      message: 'The server had an error processing your request.',
      url: 'https://example.com',
      requestBodyValues: {},
      statusCode: 500,
      data: { error: { code: 'server_error' } },
    });

    expect(formatAgentChatTurnFailedLog({ ...TURN, error })).toContain(
      'aiSdkError=AI_APICallError/500/server_error',
    );
  });

  it('omits the fields a failure without an error does not have', () => {
    expect(
      formatAgentChatTurnFailedLog({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        failurePhase: 'interrupted',
        errorCode: 'STREAM_INTERRUPTED',
      }),
    ).toBe(
      '[AI_CHAT_TURN_FAILED] threadId=thread-id workspaceId=workspace-id ' +
        'failurePhase=interrupted errorCode=STREAM_INTERRUPTED',
    );
  });
});
