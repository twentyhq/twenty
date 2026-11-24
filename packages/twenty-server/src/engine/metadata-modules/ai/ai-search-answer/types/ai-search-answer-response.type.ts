import { type ToolRecordReference } from 'twenty-shared/ai';

export type AiSearchAnswerResponse =
  | { kind: 'answer'; text: string; sources: ToolRecordReference[] }
  | { kind: 'handoff' }
  | { kind: 'limited' };
