import { type SetuAiErrorCode } from '@/ai/constants/setu-ai-error-codes.const';
import { type SetuAiTaskOperation } from '@/ai/constants/setu-ai-task-operations.const';
import { type SetuAiTaskStatus } from '@/ai/constants/setu-ai-task-statuses.const';
import { type SetuAiTaskStepOperation } from '@/ai/constants/setu-ai-task-step-operations.const';
import { type SetuAiTaskStepStatus } from '@/ai/constants/setu-ai-task-step-statuses.const';
import { type RequestFormField } from '@/ai/types/RequestFormToolInput';

// Evidence is limited to sources the research run actually retrieved: CRM
// records it read with the person's permissions, or pages the search tool
// cited.
export type SetuAiResearchEvidence =
  | {
      id: string;
      kind: 'record';
      label: string;
      objectNameSingular: string;
      recordId: string;
    }
  | { id: string; kind: 'web'; label: string; url: string };

export type SetuAiResearchBriefSection = {
  heading: string;
  body: string;
  evidenceIds: string[];
};

export type SetuAiResearchBrief = {
  summary: string;
  sections: SetuAiResearchBriefSection[];
  unknowns: string[];
  suggestedNextSteps: string[];
  evidence: SetuAiResearchEvidence[];
  scope: 'crm_only' | 'crm_and_web';
  removedEvidenceCount: number;
  savedNoteId: string | null;
};

export type SetuAiTaskPendingInput = {
  version: number;
  prompt: string;
  fields: RequestFormField[];
};

export type SetuAiTaskStepProjection = {
  id: string;
  stepKey: string;
  position: number;
  companyId: string;
  companyName: string;
  status: SetuAiTaskStepStatus;
  stateVersion: number;
  errorCode: SetuAiErrorCode | null;
  allowedOperations: SetuAiTaskStepOperation[];
  pendingInput: SetuAiTaskPendingInput | null;
  brief: SetuAiResearchBrief | null;
  completedAt: string | null;
};

// What the owner may see of a task. Model checkpoints, prompts, tool
// arguments and worker leases never leave the server.
export type SetuAiTaskProjection = {
  schemaVersion: 1;
  id: string;
  kind: 'account_research';
  status: SetuAiTaskStatus;
  stateVersion: number;
  focus: string | null;
  saveBriefsAsNotes: boolean;
  allowedOperations: SetuAiTaskOperation[];
  errorCode: SetuAiErrorCode | null;
  usage: { totalTokens: number; tokenLimit: number };
  steps: SetuAiTaskStepProjection[];
  createdAt: string;
  updatedAt: string;
};
