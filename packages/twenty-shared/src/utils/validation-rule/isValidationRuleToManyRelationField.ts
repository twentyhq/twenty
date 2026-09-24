import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';

export const isValidationRuleToManyRelationField = (
  field: ValidationRuleFieldDescriptor | undefined,
): boolean =>
  field?.type === FieldMetadataType.RELATION &&
  field.relationType === RelationType.ONE_TO_MANY;
