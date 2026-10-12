import { readToolCallStatus } from 'src/engine/metadata-modules/ai/ai-history/utils/read-tool-call-status.util';

export const isAwaitingPausingToolOutput = (toolOutput: unknown): boolean =>
  readToolCallStatus(toolOutput) === 'pending';
