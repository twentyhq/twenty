import { type FieldMetadataFormula } from './FieldMetadataFormula';
import { type FieldMetadataType } from './FieldMetadataType';
import { type RelationType } from './RelationType';

export type ValidationRuleFieldDescriptor = {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  relationType?: RelationType;
  relationTargetFields?: ValidationRuleFieldDescriptor[];
  // Set on a formula computed on read, which a formula reading it substitutes
  queryTimeFormula?: Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree'>;
};
