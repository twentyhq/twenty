import { type SetuAiActionOperation } from '@/ai/constants/setu-ai-action-operations.const';
import { type SetuAiActionStatus } from '@/ai/constants/setu-ai-action-statuses.const';
import { type SetuAiErrorCode } from '@/ai/constants/setu-ai-error-codes.const';
import { type SetuAiActionPayload } from '@/ai/types/SetuAiActionPayload';

export type SetuAiActionReceipt = {
  completedAt: string;
  summary: string;
  providerMessageId?: string;
};

// What a reviewer may see of an action. It never carries execution context,
// tokens or worker state.
export type SetuAiActionProjection = {
  schemaVersion: 1;
  id: string;
  logicalActionId: string;
  revision: number;
  stateVersion: number;
  status: SetuAiActionStatus;
  allowedOperations: SetuAiActionOperation[];
  expiresAt: string | null;
  errorCode: SetuAiErrorCode | null;
  receipt: SetuAiActionReceipt | null;
  createdAt: string;
  updatedAt: string;
} & SetuAiActionPayload;
