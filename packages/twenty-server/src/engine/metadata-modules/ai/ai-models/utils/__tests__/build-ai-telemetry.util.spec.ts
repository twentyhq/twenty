import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';

describe('buildAiTelemetry', () => {
  it('should spread the shared telemetry config and set the functionId', () => {
    const telemetry = buildAiTelemetry({ functionId: 'ai-chat-stream' });

    expect(telemetry).toMatchObject(AI_TELEMETRY_CONFIG);
    expect(telemetry.functionId).toBe('ai-chat-stream');
  });

  it('should include every provided identifier in metadata', () => {
    const telemetry = buildAiTelemetry({
      functionId: 'agent-execution',
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      agentId: 'agent-id',
      threadId: 'thread-id',
      turnId: 'turn-id',
      streamId: 'stream-id',
    });

    expect(telemetry.metadata).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      agentId: 'agent-id',
      threadId: 'thread-id',
      turnId: 'turn-id',
      streamId: 'stream-id',
    });
  });

  it('should omit undefined, null, and empty identifiers', () => {
    const telemetry = buildAiTelemetry({
      functionId: 'agent-title-generation',
      workspaceId: 'workspace-id',
      userWorkspaceId: null,
      agentId: undefined,
      threadId: '',
    });

    expect(telemetry.metadata).toEqual({ workspaceId: 'workspace-id' });
  });
});
