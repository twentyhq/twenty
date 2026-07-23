import {
  AiChatZeroOutputError,
  buildAiChatZeroOutputError,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/build-ai-chat-zero-output-error.util';
import { AI_SDK_ANTHROPIC } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

describe('buildAiChatZeroOutputError', () => {
  const baseContext = {
    modelId: 'claude-sonnet-4-5',
    sdkPackage: AI_SDK_ANTHROPIC,
    workspaceId: 'workspace-1',
    threadId: 'thread-1',
    streamId: 'stream-1',
    turnId: 'turn-1',
    messageCount: 12,
    conversationSizeTokens: 54321,
    elapsedMs: 1234.56,
  };

  it('packs all context and the underlying error into the message', () => {
    const underlyingError = new Error('Overloaded');

    underlyingError.name = 'AI_APICallError';

    const error = buildAiChatZeroOutputError({
      ...baseContext,
      underlyingError,
    });

    expect(error.message).toBe(
      'AI chat stream produced no output - ' +
        'model=claude-sonnet-4-5 provider=@ai-sdk/anthropic ' +
        'workspace=workspace-1 thread=thread-1 stream=stream-1 turn=turn-1 ' +
        'messages=12 conversationSizeTokens=54321 elapsedMs=1235 ' +
        'underlying=AI_APICallError: Overloaded',
    );
  });

  it('reports none-recorded when no underlying error was observed', () => {
    const error = buildAiChatZeroOutputError(baseContext);

    expect(error.message).toContain('underlying=none-recorded');
    expect(error.cause).toBeUndefined();
  });

  it('omits undefined identifiers without leaving gaps in the message', () => {
    const error = buildAiChatZeroOutputError({
      ...baseContext,
      threadId: undefined,
      streamId: undefined,
      turnId: undefined,
    });

    expect(error.message).not.toContain('thread=');
    expect(error.message).not.toContain('stream=stream-1');
    expect(error.message).not.toContain('turn=');
    expect(error.message).toContain('workspace=workspace-1 messages=12');
    expect(error.message).not.toContain('  ');
  });

  it('sets the underlying error as cause so it is reported as a chained exception', () => {
    const underlyingError = new Error('Connection reset');

    const error = buildAiChatZeroOutputError({
      ...baseContext,
      underlyingError,
    });

    expect(error.cause).toBe(underlyingError);
  });

  it('stringifies non-Error underlying values and still wires them as cause', () => {
    const error = buildAiChatZeroOutputError({
      ...baseContext,
      underlyingError: 'socket hang up',
    });

    expect(error.message).toContain('underlying=socket hang up');
    expect(error.cause).toBe('socket hang up');
  });

  it('keeps a distinctive name for separate Sentry grouping', () => {
    const error = buildAiChatZeroOutputError(baseContext);

    expect(error).toBeInstanceOf(AiChatZeroOutputError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AiChatZeroOutputError');
  });
});
