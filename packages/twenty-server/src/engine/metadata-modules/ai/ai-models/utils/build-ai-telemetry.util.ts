import { isNonEmptyString } from '@sniptt/guards';
import { type TelemetryOptions } from 'ai';

import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';

type BuildAiTelemetryArgs = {
  functionId: string;
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

// Identifiers travel as runtime context and are opted into telemetry one by
// one, which is how a telemetry integration receives per-call attributes.
export const buildAiTelemetry = ({
  functionId,
  ...identifiers
}: BuildAiTelemetryArgs): AiTelemetryCallOptions => {
  const runtimeContext = Object.fromEntries(
    Object.entries(identifiers).filter(([, value]) => isNonEmptyString(value)),
  ) as Record<string, string>;

  return {
    telemetry: {
      ...AI_TELEMETRY_CONFIG,
      functionId,
      includeRuntimeContext: Object.fromEntries(
        Object.keys(runtimeContext).map((key) => [key, true]),
      ),
    },
    runtimeContext,
  };
};
