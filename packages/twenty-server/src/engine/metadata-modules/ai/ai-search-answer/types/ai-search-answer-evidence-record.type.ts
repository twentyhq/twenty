import { type ToolRecordReference } from 'twenty-shared/ai';

export type AiSearchAnswerEvidenceField = {
  label: string;
  value: string;
};

export type AiSearchAnswerEvidenceRecord = ToolRecordReference & {
  objectLabel: string;
  fields: AiSearchAnswerEvidenceField[];
};
