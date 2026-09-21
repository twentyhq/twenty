import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';

describe('buildAiTelemetry', () => {
  it('should spread the shared telemetry config and set the functionId', () => {
    const { telemetry } = buildAiTelemetry({ functionId: 'ai-chat-stream' });

    expect(telemetry).toMatchObject(AI_TELEMETRY_CONFIG);
    expect(telemetry.functionId).toBe('ai-chat-stream');
  });

  it('should carry every provided identifier as runtime context and opt it into telemetry', () => {
    const { telemetry, runtimeContext } = buildAiTelemetry({
      functionId: 'agent-execution',
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      agentId: 'agent-id',
      threadId: 'thread-id',
      turnId: 'turn-id',
      streamId: 'stream-id',
    });

    expect(runtimeContext).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      agentId: 'agent-id',
      threadId: 'thread-id',
      turnId: 'turn-id',
      streamId: 'stream-id',
    });
    expect(telemetry.includeRuntimeContext).toEqual({
      workspaceId: true,
      userWorkspaceId: true,
      agentId: true,
      threadId: true,
      turnId: true,
      streamId: true,
    });
  });

  it('should omit undefined, null, and empty identifiers', () => {
    const { telemetry, runtimeContext } = buildAiTelemetry({
      functionId: 'agent-title-generation',
      workspaceId: 'workspace-id',
      userWorkspaceId: null,
      agentId: undefined,
      threadId: '',
    });

    expect(runtimeContext).toEqual({ workspaceId: 'workspace-id' });
    expect(telemetry.includeRuntimeContext).toEqual({ workspaceId: true });
  });
});
