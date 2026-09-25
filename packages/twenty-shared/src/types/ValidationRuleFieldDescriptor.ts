import { type FieldMetadataType } from './FieldMetadataType';
import { type RelationType } from './RelationType';

export type ValidationRuleFieldDescriptor = {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  relationType?: RelationType;
  relationTargetFields?: ValidationRuleFieldDescriptor[];
};
