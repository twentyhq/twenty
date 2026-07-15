export enum FirewallContext {
  SEARCH_FILTER = 'search_filter',
  AI_CONTEXT = 'ai_context',
  CLIENT_REPORT = 'client_report',
  SLATE_PRESENTATION = 'slate_presentation',
  PIPELINE_AUTOMATION = 'pipeline_automation',
  SELECTION_CONTEXT = 'selection_context',
}

export interface FirewallRegistryEntry {
  prohibitedSelector: string;
  context: FirewallContext;
  status: 'PROHIBITED';
  rule: string;
}

export type DenylistRule =
  | 'NO_SYNC'
  | 'NO_SYNC_SELECTION'
  | 'NO_SYNC_INDIVIDUAL'
  | 'REFERENCE_ONLY'
  | 'NO_SYNC_ORDINARY_CONTEXT'
  | 'QUARANTINE';

export interface DenylistEntry {
  fieldOrPattern: string;
  dataClassification: string;
  rule: DenylistRule;
  reason: string;
}

export interface FieldLeakageViolation {
  selector: string;
  fieldPath: string;
  context: FirewallContext;
  rule: string;
}

export class FirewallViolationException extends Error {
  constructor(
    message: string,
    public readonly violations: FieldLeakageViolation[],
  ) {
    super(message);
    this.name = 'FirewallViolationException';
  }
}
