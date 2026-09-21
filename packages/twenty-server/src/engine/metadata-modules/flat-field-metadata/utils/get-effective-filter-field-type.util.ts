import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A filter on a relation field is evaluated against the relation target field
// when one is set, so validation has to check the target's type
export const getEffectiveFilterFieldType = ({
  fieldType,
  relationTargetFieldType,
}: {
  fieldType: FieldMetadataType;
  relationTargetFieldType: FieldMetadataType | undefined;
}): FieldMetadataType => {
  const isRelationFieldType =
    fieldType === FieldMetadataType.RELATION ||
    fieldType === FieldMetadataType.MORPH_RELATION;

  return isRelationFieldType && isDefined(relationTargetFieldType)
    ? relationTargetFieldType
    : fieldType;
};
