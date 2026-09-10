import { isDefined } from '@/utils/validation/isDefined';

export type CodeExecutionFile = {
  fileId: string;
  filename: string;
  url: string;
  mimeType: string;
};

export type ExtendedFileUIPart = {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
  fileId: string;
};

export const isExtendedFileUIPart = (
  part: Record<string, unknown>,
): part is ExtendedFileUIPart => {
  return (
    part.type === 'file' &&
    isDefined(part.fileId) &&
    isDefined(part.url) &&
    isDefined(part.mediaType)
  );
};

export type CodeExecutionState = 'pending' | 'running' | 'completed' | 'error';

export type CodeExecutionData = {
  executionId: string;
  state: CodeExecutionState;
  code: string;
  language: 'python';
  stdout: string;
  stderr: string;
  exitCode?: number;
  executionTimeMs?: number;
  files: CodeExecutionFile[];
  error?: string;
};

export type DataMessagePart = {
  'routing-status': {
    text: string;
    state: string;
    debug?: {
      routingTimeMs?: number;
      contextBuildTimeMs?: number;
      agentExecutionStartTimeMs?: number;
      agentExecutionTimeMs?: number;
      toolGenerationTimeMs?: number;
      agentContextBuildTimeMs?: number;
      aiRequestPrepTimeMs?: number;
      selectedAgentId?: string;
      selectedAgentLabel?: string;
      availableAgents?: Array<{ id: string; label: string }>;
      fastModel?: string;
      smartModel?: string;
      agentModel?: string;
      context?: string;
      contextRecordCount?: number;
      contextSizeBytes?: number;
      toolCallCount?: number;
      toolCount?: number;
      routingPromptTokens?: number;
      routingCompletionTokens?: number;
      routingTotalTokens?: number;
      agentPromptTokens?: number;
      agentCompletionTokens?: number;
      agentTotalTokens?: number;
      routingCostInCredits?: number;
      agentCostInCredits?: number;
      totalCostInCredits?: number;
      planReasoning?: string;
      totalSteps?: number;
      steps?: Array<{
        stepNumber: number;
        agent: string;
        task: string;
      }>;
    };
  };
  'code-execution': CodeExecutionData;
  'thread-title': { title: string };
  compaction: Record<string, never>;
};
