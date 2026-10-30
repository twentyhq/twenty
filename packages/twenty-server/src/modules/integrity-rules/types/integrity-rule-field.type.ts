import { type FieldMetadataType } from 'twenty-shared/types';

export type IntegrityRuleField = {
  name: string;
  label: string;
  type: FieldMetadataType;
  recordKey: string;
  optionLabels: Record<string, string>;
};
