import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';

// A morph target (targetCompany) reads like a relation to one record
export const isValidationRuleToOneRelationField = (
  field: ValidationRuleFieldDescriptor,
) =>
  (field.type === FieldMetadataType.RELATION ||
    field.type === FieldMetadataType.MORPH_RELATION) &&
  field.relationType === RelationType.MANY_TO_ONE &&
  isDefined(field.relationTargetFields);
