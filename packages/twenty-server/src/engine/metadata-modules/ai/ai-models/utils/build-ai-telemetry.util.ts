import { isNonEmptyString } from '@sniptt/guards';
import { type TelemetryOptions } from 'ai';
import { isAiDataPolicyActive } from 'twenty-shared/ai';

import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { type WorkspaceAiPrivacySettings } from 'src/engine/metadata-modules/ai/ai-models/types/workspace-ai-privacy-settings.type';

type BuildAiTelemetryArgs = {
  functionId: string;
  privacySettings: WorkspaceAiPrivacySettings;
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
  privacySettings,
  ...identifiers
}: BuildAiTelemetryArgs): AiTelemetryCallOptions => {
  // traces are retained by the tracing backend, so a restricted workspace keeps its prompts out of them
  const isContentRecordingAllowed =
    privacySettings.isProductImprovementDataSharingEnabled &&
    !isAiDataPolicyActive(privacySettings);

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
