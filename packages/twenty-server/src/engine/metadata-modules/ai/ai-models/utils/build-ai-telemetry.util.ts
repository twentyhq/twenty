import { isNonEmptyString } from '@sniptt/guards';
import { type TelemetrySettings } from 'ai';

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

export const buildAiTelemetry = ({
  functionId,
  workspaceId,
  userWorkspaceId,
  agentId,
  threadId,
  turnId,
  streamId,
}: BuildAiTelemetryArgs): TelemetrySettings => ({
  ...AI_TELEMETRY_CONFIG,
  functionId,
  metadata: {
    ...(isNonEmptyString(workspaceId) && { workspaceId }),
    ...(isNonEmptyString(userWorkspaceId) && { userWorkspaceId }),
    ...(isNonEmptyString(agentId) && { agentId }),
    ...(isNonEmptyString(threadId) && { threadId }),
    ...(isNonEmptyString(turnId) && { turnId }),
    ...(isNonEmptyString(streamId) && { streamId }),
  },
});
