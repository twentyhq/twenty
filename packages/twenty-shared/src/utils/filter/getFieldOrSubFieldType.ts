import { compositeTypeDefinitions, type FieldMetadataType } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

export const getFieldOrSubFieldType = ({
  fieldType,
  subFieldName,
}: {
  fieldType: FieldMetadataType;
  subFieldName?: string | null;
}): FieldMetadataType => {
  const subFieldType = compositeTypeDefinitions
    .get(fieldType)
    ?.properties.find(({ name }) => name === subFieldName)?.type;

  return isDefined(subFieldName) && isDefined(subFieldType)
    ? subFieldType
    : fieldType;
};
