import { type ProposedToolCallTemplate } from '@/ai/constants/proposed-tool-call-templates.const';

// Resolved by the server when the call is proposed: the card picks its template from it, and
// currentValues holds the fields an update changes as they were, so a later edit can be detected.
export type ProposedToolCall = {
  toolName: string;
  toolLabel: string;
  summary: string;
  arguments: Record<string, unknown>;
  template: ProposedToolCallTemplate;
  alternativeToolNames?: string[];
  objectNameSingular?: string;
  recordId?: string;
  currentValues?: Record<string, unknown>;
};
