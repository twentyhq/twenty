import { isNonEmptyString } from '@sniptt/guards';
import { type TelemetryOptions } from 'ai';
import { isAiDataPolicyActive, type AiDataPolicy } from 'twenty-shared/ai';

import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';

type BuildAiTelemetryArgs = {
  functionId: string;
  aiDataPolicy: AiDataPolicy;
  workspaceId?: string;
  userWorkspaceId?: string | null;
  agentId?: string | null;
  threadId?: string;
  turnId?: string;
  streamId?: string;
};

type AiTelemetryCallOptions = {
  telemetry: TelemetryOptions<Record<string, string>>;
  runtimeContext: Record<string, string>;
};

// telemetry integrations only receive per-call attributes opted in from runtime context
export const buildAiTelemetry = ({
  functionId,
  aiDataPolicy,
  ...identifiers
}: BuildAiTelemetryArgs): AiTelemetryCallOptions => {
  // traces are retained by the tracing backend, so a restricted workspace keeps its prompts out of them
  const isContentRecordingAllowed = !isAiDataPolicyActive(aiDataPolicy);

  const runtimeContext = Object.fromEntries(
    Object.entries(identifiers).filter(([, value]) => isNonEmptyString(value)),
  ) as Record<string, string>;

  return {
    telemetry: {
      ...AI_TELEMETRY_CONFIG,
      recordInputs: isContentRecordingAllowed,
      recordOutputs: isContentRecordingAllowed,
      functionId,
      includeRuntimeContext: Object.fromEntries(
        Object.keys(runtimeContext).map((key) => [key, true]),
      ),
    },
    runtimeContext,
  };
};
